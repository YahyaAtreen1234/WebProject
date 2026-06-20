import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Verify ownership
    const method = await prisma.paymentMethod.findUnique({
      where: { id: params.id },
    });

    if (!method || method.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (body.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: auth.userId, id: { not: params.id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.paymentMethod.update({
      where: { id: params.id },
      data: body,
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

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify ownership
    const method = await prisma.paymentMethod.findUnique({
      where: { id: params.id },
    });

    if (!method || method.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.paymentMethod.delete({
      where: { id: params.id },
    });

    // If this was the default, set another one as default
    if (method.isDefault) {
      const another = await prisma.paymentMethod.findFirst({
        where: { userId: auth.userId },
      });

      if (another) {
        await prisma.paymentMethod.update({
          where: { id: another.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}
