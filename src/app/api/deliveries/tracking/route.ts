import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('trackingNumber');

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number required' },
        { status: 400 }
      );
    }

    const delivery = await prisma.delivery.findUnique({
      where: { trackingNumber },
      include: {
        trackingHistory: { orderBy: { timestamp: 'desc' } },
        order: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            address: true,
            city: true,
          },
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
    console.error('Error tracking delivery:', error);
    return NextResponse.json(
      { error: 'Failed to track delivery' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deliveryId, status, location, latitude, longitude, description } = body;

    if (!deliveryId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create tracking event
    const trackingEvent = await prisma.trackingEvent.create({
      data: {
        deliveryId,
        status,
        location: location || 'Unknown',
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        description: description || `Status: ${status}`,
      },
    });

    // Update delivery status
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status,
        currentLocation: location,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      },
    });

    return NextResponse.json(trackingEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating tracking event:', error);
    return NextResponse.json(
      { error: 'Failed to create tracking event' },
      { status: 500 }
    );
  }
}
