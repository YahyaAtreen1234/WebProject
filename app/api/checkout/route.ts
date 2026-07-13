import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerEmail,
      customerName,
      items,
      subtotal,
      tax,
      shipping,
      total,
      address,
      city,
      postalCode,
      country,
      state,
    } = body;

    if (!customerEmail || !items || !subtotal || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone: '', // Will be updated in checkout
        address: address || '',
        city: city || '',
        state: state || '',
        postalCode: postalCode || '',
        country: country || '',
        subtotal,
        tax,
        shipping,
        totalAmount: total,
        status: 'pending',
        paymentStatus: 'pending',
      },
    });

    // Create order items
    interface OrderItemInput {
      id: string;
      price: number;
      quantity: number;
      title: string;
    }

    await Promise.all(
      items.map((item: OrderItemInput) =>
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.id || 'unknown',
            quantity: item.quantity,
            price: item.price,
            title: item.title,
          },
        })
      )
    );

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      orderId: order.id,
      customerEmail,
      customerName,
      items: items.map((item: any) => ({
        name: item.name,
        amount: item.price,
        currency: 'usd',
        quantity: item.quantity,
      })),
      subtotal,
      tax,
      shipping,
      total,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?order_id=${order.id}`,
    });

    // Update order with Stripe payment ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: session.payment_intent as string },
    });

    return NextResponse.json({
      sessionId: session.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
