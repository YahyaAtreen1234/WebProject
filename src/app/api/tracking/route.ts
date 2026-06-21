import { prisma } from '@/lib/db';
import { isValidTrackingNumber } from '@/lib/tracking';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const trackingNumber = request.nextUrl.searchParams.get('trackingNumber');

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    if (!isValidTrackingNumber(trackingNumber)) {
      return NextResponse.json(
        { error: 'Invalid tracking number format' },
        { status: 400 }
      );
    }

    const delivery = await prisma.delivery.findUnique({
      where: { trackingNumber },
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            totalAmount: true,
            address: true,
            city: true,
            postalCode: true,
            country: true,
            createdAt: true,
            status: true,
          },
        },
        trackingHistory: {
          orderBy: { timestamp: 'desc' },
        },
        notifications: {
          where: { sent: true },
          orderBy: { sentAt: 'desc' },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: 'Tracking number not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error('Error fetching tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
