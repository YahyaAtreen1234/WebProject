import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

async function verifyAuth(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const token = auth.substring(7);
    return jwt.verify(token, process.env.JWT_SECRET || 'secret-key') as any;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    const where: any = auth?.userId ? { userId: auth.userId } : {};
    if (status) where.status = status;

    const orders = await prisma.customOrder.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  
  try {
    const body = await request.json();
    const { description, budget, deadline, items, customerName, customerEmail } = body;

    if (!description) {
      return NextResponse.json({ error: 'Description required' }, { status: 400 });
    }

    const order = await prisma.customOrder.create({
      data: {
        customOrderNumber: `CO_${Date.now()}`,
        userId: auth?.userId,
        customerName: customerName || (auth ? 'Registered User' : 'Guest'),
        customerEmail: customerEmail || auth?.email || '',
        description,
        budget,
        deadline,
        items: {
          create: items || [],
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}