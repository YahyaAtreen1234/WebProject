import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { verifyToken, getTokenFromRequest } from '@/src/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carrier = searchParams.get('carrier');
    const weight = searchParams.get('weight');

    let where: Record<string, unknown> = { active: true };
    if (carrier) where.carrier = carrier;

    const rates = await prisma.shippingRate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Filter by weight if provided
    let filteredRates = rates;
    if (weight) {
      const w = parseFloat(weight);
      filteredRates = rates.filter(
        (r) => w >= r.minWeight && w <= r.maxWeight
      );
    }

    return NextResponse.json(filteredRates);
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping rates' },
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
      carrier,
      method,
      minWeight,
      maxWeight,
      baseRate,
      perKgRate,
      daysEstimate,
    } = body;

    if (!carrier || !method || baseRate === undefined || perKgRate === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const rate = await prisma.shippingRate.create({
      data: {
        carrier,
        method,
        minWeight: parseFloat(minWeight) || 0,
        maxWeight: parseFloat(maxWeight) || 1000,
        baseRate: parseFloat(baseRate),
        perKgRate: parseFloat(perKgRate),
        daysEstimate: parseInt(daysEstimate) || 5,
      },
    });

    return NextResponse.json(rate, { status: 201 });
  } catch (error) {
    console.error('Error creating shipping rate:', error);
    return NextResponse.json(
      { error: 'Failed to create shipping rate' },
      { status: 500 }
    );
  }
}
