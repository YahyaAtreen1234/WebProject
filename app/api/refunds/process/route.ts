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

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { refundId } = body;

    if (!refundId) {
      return NextResponse.json(
        { error: 'Refund ID required' },
        { status: 400 }
      );
    }

    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        return: {
          include: {
            order: {
              include: { paymentRecords: true },
            },
          },
        },
      },
    });

    if (!refund) {
      return NextResponse.json({ error: 'Refund not found' }, { status: 404 });
    }

    if (refund.status !== 'approved') {
      return NextResponse.json(
        { error: 'Refund must be approved before processing' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Find the original payment record
    // 2. Call the payment processor's refund API
    // 3. Handle the response

    const refundRecord = await prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'processing',
        processedAt: new Date(),
      },
    });

    // Update return status
    if (refund.return) {
      await prisma.return.update({
        where: { id: refund.return.id },
        data: {
          status: 'refunded',
          completedAt: new Date(),
        },
      });
    }

    // Simulate processing (in production, this would call payment processor)
    setTimeout(async () => {
      try {
        await prisma.refund.update({
          where: { id: refundId },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        });
      } catch (error) {
        console.error('Error completing refund:', error);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      refund: refundRecord,
      message: 'Refund is being processed. Customer will receive funds within 5-10 business days.',
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
