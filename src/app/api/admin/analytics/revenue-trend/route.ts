import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
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
    // Get last 30 days of revenue
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const dailyData: Record<string, number> = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + order.totalAmount;
    });

    // Create array for all 30 days
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      result.push({
        date: dateStr,
        revenue: dailyData[dateStr] || 0,
        displayDate: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching revenue trend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue trend' },
      { status: 500 }
    );
  }
}
