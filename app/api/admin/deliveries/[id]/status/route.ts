import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function verifyAdmin(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return null;
    }
    const token = auth.substring(7);
    const payload = verifyToken(token) as Record<string, unknown> | null;
    return payload?.isAdmin ? payload : null;
  } catch {
    return null;
  }
}

const VALID_STATUSES = ['pending', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, location, latitude, longitude, description } = body;

    // Validation
    if (!status || !location) {
      return NextResponse.json(
        { error: 'Status and location are required' },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Check delivery exists
    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
    });
    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    // Create tracking event
    const trackingEvent = await prisma.trackingEvent.create({
      data: {
        deliveryId: params.id,
        status,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        description: description || undefined,
      },
    });

    // Update delivery status and location
    const updatedDelivery = await prisma.delivery.update({
      where: { id: params.id },
      data: {
        status,
        currentLocation: location,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        ...(status === 'delivered' && { actualDelivery: new Date() }),
      },
      include: {
        order: true,
        trackingHistory: { orderBy: { timestamp: 'desc' } },
      },
    });

    // Create notification for customer
    const notificationMessage = `Your package (${delivery.trackingNumber}) is now ${status.replace('_', ' ')} at ${location}`;
    await prisma.deliveryNotification.create({
      data: {
        deliveryId: params.id,
        type: 'email',
        recipient: delivery.order?.customerEmail || 'unknown@example.com',
        subject: `Delivery Update: ${notificationMessage}`,
        message: notificationMessage,
        sent: false,
      },
    });

    console.log('[DeliveryAPI] Status updated:', params.id, 'to', status);
    return NextResponse.json({
      delivery: updatedDelivery,
      trackingEvent,
    });
  } catch (error) {
    console.error('[DeliveryAPI] Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery status' },
      { status: 500 }
    );
  }
}
