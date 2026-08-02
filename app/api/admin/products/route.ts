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

    if (!payload?.isAdmin) {
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
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
    const { title, description, price, category, stock, image, featured, trackingNumber, dealDeadline } = body;

    if (!title || !description || price === undefined || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if tracking number is unique (if provided)
    if (trackingNumber) {
      const existing = await prisma.product.findFirst({
        where: { trackingNumber },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Tracking number already exists. Please use a unique tracking number.' },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price.toString()),
        category,
        stock: parseInt(stock?.toString() || '0'),
        image: image || null,
        featured: featured || false,
        trackingNumber: trackingNumber || null,
        dealDeadline: dealDeadline ? new Date(dealDeadline) : null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
