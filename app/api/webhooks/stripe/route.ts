import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { completeOrderPayment } from '@/lib/order-payment';
import { toCents } from '@/lib/pricing';
import { getStripeClient, isStripeConfigured } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!isStripeConfigured() || !webhookSecret) {
    console.error('[stripe] Webhook is not configured.');
    return NextResponse.json({ error: 'Payment webhook is not configured.' }, { status: 503 });
  }
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = getStripeClient().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('[stripe] Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid Stripe signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId && session.payment_status === 'paid') {
          const order = await prisma.order.findUnique({ where: { id: orderId } });
          if (
            !order ||
            (order.paymentMethod !== 'stripe' && order.paymentMethod !== null) ||
            session.currency?.toLowerCase() !== 'usd' ||
            session.amount_total !== toCents(order.totalAmount)
          ) {
            throw new Error(`Stripe session does not match order ${orderId}.`);
          }

          const paymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id;
          await completeOrderPayment({
            orderId,
            paymentMethod: 'stripe',
            paymentRecordType: 'credit_card',
            transactionId: paymentIntentId || session.id,
            ...(paymentIntentId && { stripePaymentId: paymentIntentId }),
          });
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await prisma.order.updateMany({
            where: { id: orderId, paymentStatus: 'pending', paymentMethod: 'stripe' },
            data: { paymentStatus: 'failed', status: 'cancelled' },
          });
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await prisma.order.updateMany({
            where: { id: orderId, paymentStatus: 'pending', paymentMethod: 'stripe' },
            data: { paymentStatus: 'failed', status: 'cancelled' },
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (paymentIntentId) {
          const order = await prisma.order.findFirst({
            where: { stripePaymentId: paymentIntentId },
          });
          if (order) {
            await prisma.$transaction([
              prisma.order.update({
                where: { id: order.id },
                data: { paymentStatus: 'refunded', status: 'cancelled' },
              }),
              prisma.paymentRecord.updateMany({
                where: { orderId: order.id, status: 'completed' },
                data: { status: 'refunded', refundedAt: new Date() },
              }),
            ]);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe] Webhook processing failed:', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
