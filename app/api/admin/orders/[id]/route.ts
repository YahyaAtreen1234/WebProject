import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { completeOrderPayment } from '@/lib/order-payment';

async function verifyAdmin(request: NextRequest) {
  try {
    if (!process.env.JWT_SECRET) return null;
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return null;
    }

    const token = auth.substring(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET) as any;

    if (!payload.isAdmin) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, title: true, price: true },
            },
          },
        },
        delivery: true,
        returns: {
          include: { itemsToReturn: true, refund: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, notes } = body;

    if (body.confirmBankTransfer === true) {
      const current = await prisma.order.findUnique({ where: { id: params.id } });
      if (!current || current.paymentMethod !== 'bank_transfer') {
        return NextResponse.json({ error: 'Bank transfer order not found.' }, { status: 404 });
      }
      if (current.paymentStatus !== 'pending' || current.status === 'cancelled') {
        return NextResponse.json(
          { error: 'This order is not awaiting bank transfer confirmation.' },
          { status: 409 }
        );
      }

      await completeOrderPayment({
        orderId: current.id,
        paymentMethod: 'bank_transfer',
        paymentRecordType: 'bank_transfer',
        transactionId: `BANK-${current.orderNumber}`,
      });

      const confirmed = await prisma.order.findUnique({
        where: { id: current.id },
        include: { items: true, delivery: true },
      });
      return NextResponse.json(confirmed);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'paymentStatus')) {
      return NextResponse.json(
        { error: 'Payment status can only be changed by verified payment confirmation.' },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
      },
      include: { items: true, delivery: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}