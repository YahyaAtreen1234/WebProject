import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { generateUniqueTrackingNumber } from '@/lib/tracking';

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

export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const carrier = searchParams.get('carrier');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (carrier) where.carrier = carrier;
    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { order: { id: { contains: search, mode: 'insensitive' } } },
        { order: { customerName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              customerName: true,
              totalAmount: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.delivery.count({ where }),
    ]);

    return NextResponse.json({
      deliveries,
      total,
      pages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error('[DeliveryAPI] Error fetching deliveries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      orderId,
      trackingNumber: customTrackingNumber,
      carrier,
      shippingMethod,
      estimatedDays,
      weight,
      dimensions,
      shippingCost,
      insuranceCost,
      currentLocation,
      latitude,
      longitude,
      estimatedDelivery,
    } = body;

    // Validation
    if (!orderId || !carrier || !shippingMethod || !estimatedDays || !shippingCost) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if delivery already exists for this order
    const existingDelivery = await prisma.delivery.findUnique({
      where: { orderId },
    });
    if (existingDelivery) {
      return NextResponse.json(
        { error: 'Delivery already exists for this order' },
        { status: 400 }
      );
    }

    // Generate or validate tracking number
    let trackingNumber = customTrackingNumber;
    if (!trackingNumber) {
      trackingNumber = await generateUniqueTrackingNumber();
    } else {
      const existing = await prisma.delivery.findUnique({
        where: { trackingNumber },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Tracking number already exists' },
          { status: 400 }
        );
      }
    }

    // Create delivery
    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        trackingNumber,
        carrier,
        shippingMethod,
        estimatedDays,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
        shippingCost: parseFloat(shippingCost),
        insuranceCost: insuranceCost ? parseFloat(insuranceCost) : null,
        totalShippingCost: parseFloat(shippingCost) + (insuranceCost ? parseFloat(insuranceCost) : 0),
        currentLocation: currentLocation || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        status: 'pending',
      },
      include: {
        order: true,
      },
    });

    // Create initial tracking event
    await prisma.trackingEvent.create({
      data: {
        deliveryId: delivery.id,
        status: 'pending',
        location: currentLocation || 'Pending',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        description: 'Delivery created',
      },
    });

    console.log('[DeliveryAPI] Delivery created:', trackingNumber);
    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    console.error('[DeliveryAPI] Error creating delivery:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery' },
      { status: 500 }
    );
  }
}
