import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { verifyToken, getTokenFromRequest } from '@/src/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const trackingNumber = searchParams.get('trackingNumber');
    const status = searchParams.get('status');

    let where: Record<string, unknown> = {};
    if (orderId) where.orderId = orderId;
    if (trackingNumber) where.trackingNumber = trackingNumber;
    if (status) where.status = status;

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        trackingHistory: { orderBy: { timestamp: 'desc' } },
        notifications: true,
      },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload?.adminId) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      orderId,
      trackingNumber,
      carrier,
      shippingMethod,
      estimatedDays,
      shippingCost,
      insuranceCost,
      weight,
    } = body;

    if (!orderId || !trackingNumber || !carrier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        trackingNumber,
        carrier,
        shippingMethod: shippingMethod || 'Standard',
        estimatedDays: estimatedDays || 5,
        shippingCost: parseFloat(shippingCost) || 0,
        insuranceCost: insuranceCost ? parseFloat(insuranceCost) : null,
        totalShippingCost: (parseFloat(shippingCost) || 0) + (insuranceCost ? parseFloat(insuranceCost) : 0),
        weight: weight ? parseFloat(weight) : null,
        estimatedDelivery: new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000),
      },
      include: {
        trackingHistory: true,
        notifications: true,
      },
    });

    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery' },
      { status: 500 }
    );
  }
}
