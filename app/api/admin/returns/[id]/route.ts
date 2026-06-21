import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

async function verifyAdmin(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return null;
    }

    const token = auth.substring(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret-key') as any;

    if (!payload.isAdmin) {
      return null;
    }

    return payload;
  } catch {
    return null;
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
    const { status, shippingLabel, trackingNumber, approveRefund } = body;

    const returnRecord = await prisma.return.findUnique({
      where: { id: params.id },
      include: { refund: true },
    });

    if (!returnRecord) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    // Update return status
    const updateData: any = { status };

    if (status === 'approved') {
      updateData.approvedAt = new Date();
    } else if (status === 'shipped') {
      updateData.shippedAt = new Date();
      if (shippingLabel) updateData.shippingLabel = shippingLabel;
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
    } else if (status === 'received') {
      updateData.receivedAt = new Date();
    }

    const updated = await prisma.return.update({
      where: { id: params.id },
      data: updateData,
      include: { refund: true, itemsToReturn: true },
    });

    // If approveRefund, update refund status
    if (approveRefund && returnRecord.refund) {
      await prisma.refund.update({
        where: { id: returnRecord.refund.id },
        data: {
          status: 'approved',
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update return' },
      { status: 500 }
    );
  }
}
