import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const VALID_STATUSES = ['pending', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];

export async function PUT(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
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

    const trackingNumber = params.trackingNumber;
    const body = await request.json();
    const { status, location, latitude, longitude, description, actualDelivery } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Find delivery
    const delivery = await prisma.delivery.findUnique({
      where: { trackingNumber },
      include: { order: true },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: 'Tracking number not found' },
        { status: 404 }
      );
    }

    // Update delivery
    const updatedDelivery = await prisma.delivery.update({
      where: { trackingNumber },
      data: {
        status,
        currentLocation: location,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        actualDelivery: actualDelivery ? new Date(actualDelivery) : undefined,
        trackingHistory: {
          create: {
            status,
            location,
            latitude: latitude || undefined,
            longitude: longitude || undefined,
            description: description || `Status updated to ${status}`,
          },
        },
      },
      include: {
        trackingHistory: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      delivery: updatedDelivery,
      message: `Tracking updated to: ${status}`,
    });
  } catch (error) {
    console.error('Error updating tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const trackingNumber = params.trackingNumber;

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
