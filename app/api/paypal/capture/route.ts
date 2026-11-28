import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { completeOrderPayment } from '@/lib/order-payment';
import { toCents } from '@/lib/pricing';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid PayPal confirmation request.' }, { status: 400 });
    }
    const orderId = body?.orderId;
    const paypalOrderId = body?.paypalOrderId;
    if (
      typeof orderId !== 'string' ||
      !orderId ||
      typeof paypalOrderId !== 'string' ||
      !paypalOrderId
    ) {
      return NextResponse.json({ error: 'Order details are required.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.paymentMethod !== 'paypal') {
      return NextResponse.json({ error: 'PayPal order not found.' }, { status: 404 });
    }
    if (
      (order.paymentStatus !== 'pending' && order.paymentStatus !== 'succeeded') ||
      order.status === 'cancelled'
    ) {
      return NextResponse.json({ error: 'This order is not awaiting PayPal payment.' }, { status: 409 });
    }

    const paymentRecord = await prisma.paymentRecord.findFirst({
      where: {
        orderId,
        type: 'paypal',
        transactionId: paypalOrderId,
        status: { in: ['pending', 'completed'] },
      },
    });
    if (!paymentRecord) {
      return NextResponse.json({ error: 'PayPal order does not match this checkout.' }, { status: 403 });
    }

    const paypalOrder = await capturePayPalOrder(paypalOrderId);
    const purchase = paypalOrder.purchase_units?.find(
      (unit) => unit.custom_id === order.id && unit.invoice_id === order.orderNumber
    );
    const capture = purchase?.payments?.captures?.find((item) => item.status === 'COMPLETED');

    if (
      paypalOrder.status !== 'COMPLETED' ||
      !purchase ||
      !capture ||
      capture.amount.currency_code !== 'USD' ||
      toCents(Number(capture.amount.value)) !== toCents(order.totalAmount)
    ) {
      return NextResponse.json(
        { error: 'PayPal has not confirmed the full order payment yet.' },
        { status: 409 }
      );
    }

    await completeOrderPayment({
      orderId,
      paymentMethod: 'paypal',
      paymentRecordType: 'paypal',
      transactionId: paypalOrderId,
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      total: order.totalAmount,
    });
  } catch (error) {
    console.error('[PayPal] Capture verification failed:', error);
    return NextResponse.json(
      { error: 'Could not confirm PayPal payment yet. Please retry or contact the store before paying again.' },
      { status: 502 }
    );
  }
}
