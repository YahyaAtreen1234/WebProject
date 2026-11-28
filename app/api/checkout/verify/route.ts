import { NextRequest, NextResponse } from 'next/server';
import { completeOrderPayment } from '@/lib/order-payment';
import { toCents } from '@/lib/pricing';
import { prisma } from '@/lib/db';
import { retrieveSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid payment verification request.' }, { status: 400 });
  }
  const sessionId = body?.sessionId;
  const orderId = body?.orderId;
  if (typeof sessionId !== 'string' || typeof orderId !== 'string' || !sessionId || !orderId) {
    return NextResponse.json({ error: 'Checkout session and order are required.' }, { status: 400 });
  }

  try {
    const [session, order] = await Promise.all([
      retrieveSession(sessionId),
      prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      }),
    ]);

    if (!order || order.paymentMethod !== 'stripe' || session.metadata?.orderId !== order.id) {
      return NextResponse.json({ error: 'Checkout session does not match this order.' }, { status: 404 });
    }

    const paid =
      session.payment_status === 'paid' &&
      session.currency?.toLowerCase() === 'usd' &&
      session.amount_total === toCents(order.totalAmount);

    if (session.payment_status === 'paid' && !paid) {
      return NextResponse.json(
        { error: 'The confirmed payment amount does not match this order. Contact the store before taking further action.' },
        { status: 409 }
      );
    }

    if (paid && order.paymentStatus !== 'succeeded') {
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;
      await completeOrderPayment({
        orderId: order.id,
        paymentMethod: 'stripe',
        paymentRecordType: 'credit_card',
        transactionId: paymentIntentId || session.id,
        ...(paymentIntentId && { stripePaymentId: paymentIntentId }),
      });
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
    const paymentConfirmed = paid && currentOrder?.paymentStatus === 'succeeded';

    return NextResponse.json({
      paid: paymentConfirmed,
      order: currentOrder
        ? {
            orderNumber: currentOrder.orderNumber,
            createdAt: currentOrder.createdAt,
            totalAmount: currentOrder.totalAmount,
            status: currentOrder.status,
            items: currentOrder.items.map((item) => ({
              id: item.id,
              title: item.title,
              quantity: item.quantity,
              price: item.price,
            })),
          }
        : null,
    });
  } catch (error) {
    console.error('[Checkout] Stripe verification failed:', error);
    return NextResponse.json(
      { error: 'Payment verification is temporarily unavailable. Your payment status is not yet confirmed.' },
      { status: 502 }
    );
  }
}
