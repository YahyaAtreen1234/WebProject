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

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { userId: auth.userId },
      select: {
        id: true,
        type: true,
        last4: true,
        cardholderName: true,
        paypalEmail: true,
        bankName: true,
        isDefault: true,
        active: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(methods);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, last4, cardholderName, paypalEmail, bankName, accountLast4 } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Payment type required' },
        { status: 400 }
      );
    }

    // If this will be the first payment method, make it default
    const count = await prisma.paymentMethod.count({
      where: { userId: auth.userId },
    });

    const method = await prisma.paymentMethod.create({
      data: {
        userId: auth.userId,
        type,
        last4,
        cardholderName,
        paypalEmail,
        bankName,
        accountLast4,
        isDefault: count === 0,
      },
      select: {
        id: true,
        type: true,
        last4: true,
        cardholderName: true,
        paypalEmail: true,
        bankName: true,
        isDefault: true,
      },
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
}
