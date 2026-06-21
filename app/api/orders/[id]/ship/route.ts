import { prisma } from '@/lib/db';
import { generateUniqueTrackingNumber } from '@/lib/tracking';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = params.id;
    const body = await request.json();
    const { carrier, shippingMethod, estimatedDays, shippingCost = 0 } = body;

    if (!carrier || !shippingMethod || !estimatedDays) {
      return NextResponse.json(
        { error: 'Missing required fields: carrier, shippingMethod, estimatedDays' },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Don't allow shipping if delivery already exists
    if (order.delivery) {
      return NextResponse.json(
        { error: 'Delivery record already exists for this order' },
        { status: 400 }
      );
    }

    // Generate unique tracking number
    const trackingNumber = await generateUniqueTrackingNumber();

    // Calculate estimated delivery date
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

    // Create delivery record
    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        trackingNumber,
        carrier,
        shippingMethod,
        estimatedDays,
        shippingCost,
        totalShippingCost: shippingCost,
        status: 'pending',
        estimatedDelivery,
        trackingHistory: {
          create: {
            status: 'pending',
            location: 'Preparing for shipment',
            description: 'Order prepared and ready for shipment',
          },
        },
        notifications: {
          create: {
            type: 'email',
            recipient: order.customerEmail,
            subject: `Your StonesLand Order #${orderId} Has Been Shipped!`,
            message: `Your order has been shipped with tracking number: ${trackingNumber}. Estimated delivery: ${estimatedDelivery.toLocaleDateString()}`,
            sent: false,
          },
        },
      },
      include: {
        trackingHistory: true,
        notifications: true,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'shipped' },
    });

    return NextResponse.json(
      {
        success: true,
        delivery,
        message: `Order shipped successfully. Tracking number: ${trackingNumber}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error shipping order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
