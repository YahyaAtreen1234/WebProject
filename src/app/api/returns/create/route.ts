import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

async function verifyAuth(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return null;
    }

    const token = auth.substring(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret-key') as any;
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, items, reason, description } = body;

    if (!orderId || !items || items.length === 0 || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: auth.userId,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if return is allowed (within 30 days)
    const orderDate = new Date(order.createdAt);
    const daysSince = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince > 30) {
      return NextResponse.json(
        { error: 'Return period has expired. Items can only be returned within 30 days of purchase.' },
        { status: 400 }
      );
    }

    // Create return
    const returnNumber = `RET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const returnRecord = await prisma.return.create({
      data: {
        orderId,
        returnNumber,
        reason,
        description,
        status: 'requested',
        itemsToReturn: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            reason: item.reason,
            condition: item.condition || 'like_new',
          })),
        },
      },
      include: { itemsToReturn: true },
    });

    // Calculate refund amount (simplified - could add restocking fees, etc.)
    let refundAmount = 0;
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
    });

    for (const item of items) {
      const orderItem = orderItems.find((oi) => oi.productId === item.productId);
      if (orderItem) {
        refundAmount += orderItem.price * item.quantity;
      }
    }

    // Create refund record
    await prisma.refund.create({
      data: {
        returnId: returnRecord.id,
        status: 'pending',
        amount: refundAmount,
        reason: 'Return initiated',
      },
    });

    return NextResponse.json(
      {
        success: true,
        return: returnRecord,
        refundAmount,
        message: 'Return request created successfully. We will review it and update you soon.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating return:', error);
    return NextResponse.json(
      { error: 'Failed to create return request' },
      { status: 500 }
    );
  }
}
