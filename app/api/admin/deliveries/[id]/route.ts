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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: {
        order: true,
        trackingHistory: {
          orderBy: { timestamp: 'desc' },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error('[DeliveryAPI] Error fetching delivery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      currentLocation,
      latitude,
      longitude,
      notes,
      carrier,
      estimatedDelivery,
    } = body;

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

    // Update delivery
    const updated = await prisma.delivery.update({
      where: { id: params.id },
      data: {
        ...(currentLocation && { currentLocation }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(notes !== undefined && { notes }),
        ...(carrier && { carrier }),
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
      },
      include: {
        order: true,
        trackingHistory: { orderBy: { timestamp: 'desc' } },
        notifications: { orderBy: { createdAt: 'desc' } },
      },
    });

    console.log('[DeliveryAPI] Delivery updated:', params.id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[DeliveryAPI] Error updating delivery:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery' },
      { status: 500 }
    );
  }
}
