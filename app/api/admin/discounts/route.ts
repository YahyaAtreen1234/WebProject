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

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (active === 'true') where.active = true;
    if (active === 'false') where.active = false;

    const [discounts, total] = await Promise.all([
      prisma.discount.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: { usages: { select: { id: true } } },
      }),
      prisma.discount.count({ where }),
    ]);

    const formattedDiscounts = discounts.map((d) => ({
      ...d,
      usageCount: d.usages.length,
      usages: undefined,
    }));

    return NextResponse.json({
      discounts: formattedDiscounts,
      total,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      code,
      type,
      value,
      description,
      minOrderAmount = 0,
      maxDiscount,
      maxUses,
      expiryDate,
    } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Code, type, and value are required' },
        { status: 400 }
      );
    }

    if (!['percentage', 'fixed', 'free_shipping'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid discount type' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        description,
        minOrderAmount,
        maxDiscount,
        maxUses,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        active: true,
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create discount' },
      { status: 500 }
    );
  }
}
