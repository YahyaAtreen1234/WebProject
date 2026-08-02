import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');

    // At least one search parameter is required
    if (!orderNumber && !email) {
      return NextResponse.json(
        { error: 'Order number or email is required' },
        { status: 400 }
      );
    }

    // Build where clause based on search parameters
    const where: Record<string, unknown> = {};
    if (orderNumber) where.orderNumber = orderNumber;
    if (email) where.customerEmail = email;

    // Search for the order
    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        delivery: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Format the response
    const response = {
      id: order.id,
      orderNumber: order.orderNumber,
      email: order.customerEmail,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      estimatedDelivery: order.delivery?.estimatedDelivery || null,
      trackingNumber: order.delivery?.trackingNumber || null,
      carrier: order.delivery?.carrier || null,
      items: order.items.map((item: any) => ({
        id: item.id,
        title: item.product?.title || item.title,
        quantity: item.quantity,
        price: item.price,
        trackingNumber: item.trackingNumber || item.product?.trackingNumber,
      })),
      address: order.address,
      city: order.city,
      postalCode: order.postalCode,
      country: order.country,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[api/orders/search] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
