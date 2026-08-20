import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { sendOrderConfirmation } from '@/lib/email';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          const existing = await prisma.order.findUnique({
            where: { id: orderId },
            select: { paymentStatus: true },
          });

          // Stripe retries webhooks and may deliver the same event more than
          // once. Without this guard a retry would decrement stock a second
          // time for a single sale.
          if (existing?.paymentStatus === 'succeeded') {
            console.log('[stripe] Ignoring duplicate completion for', orderId);
            break;
          }

          const order = await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'succeeded',
              status: 'confirmed',
              // Captured here rather than at session creation: the payment
              // intent does not exist until the customer actually pays.
              stripePaymentId: (session.payment_intent as string) || undefined,
            },
            include: {
              items: true,
            },
          });

          // Money is in. Take the goods out of stock -- nothing else in the
          // codebase did, so every item stayed permanently in stock and could
          // be oversold without limit.
          await Promise.all(
            order.items.map((item) =>
              prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
              }).catch((stockError) => {
                // A missing or deleted product must not roll back a paid order.
                console.error('[stripe] Stock update failed for', item.productId, stockError);
              })
            )
          );

          // Record the receipt so admin earnings reconcile against Stripe.
          await prisma.paymentRecord.create({
            data: {
              orderId: order.id,
              amount: order.totalAmount,
              currency: 'USD',
              type: 'credit_card',
              status: 'completed',
              transactionId: (session.payment_intent as string) || session.id,
              processedAt: new Date(),
            },
          }).catch((recordError) => {
            console.error('[stripe] Payment record failed for', order.id, recordError);
          });

          if (order.discountCode) {
            await prisma.discount.updateMany({
              where: { code: order.discountCode },
              data: { timesUsed: { increment: 1 } },
            }).catch(() => undefined);
          }

          // Send confirmation email
          await sendOrderConfirmation({
            orderNumber: order.orderNumber,
            customerEmail: order.customerEmail,
            customerName: order.customerName,
            items: order.items.map((item) => ({
              name: item.title,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal: order.subtotal,
            tax: order.tax,
            shipping: order.shipping,
            total: order.totalAmount,
            address: order.address,
            city: order.city,
            postalCode: order.postalCode,
            country: order.country,
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'failed',
              status: 'cancelled',
            },
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent;

        if (paymentIntentId) {
          const order = await prisma.order.findFirst({
            where: { stripePaymentId: paymentIntentId },
          });

          if (order) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'refunded',
                status: 'cancelled',
              },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
