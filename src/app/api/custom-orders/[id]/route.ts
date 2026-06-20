import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.customOrder.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);
  
  try {
    const body = await request.json();
    const { status, adminNotes, quotedPrice, finalPrice } = body;

    const order = await prisma.customOrder.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(adminNotes && { adminNotes }),
        ...(quotedPrice && { quotedPrice, quotedAt: new Date() }),
        ...(finalPrice && { finalPrice }),
      },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);
  
  try {
    await prisma.customOrder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}