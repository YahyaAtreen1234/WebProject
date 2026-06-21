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
    const period = searchParams.get('period') || '30'; // days
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all metrics in parallel
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      averageOrderValue,
      topProducts,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      // Total orders
      prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Total revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: { totalAmount: true },
      }),

      // Total unique customers
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Average order value
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate } },
        _avg: { totalAmount: true },
      }),

      // Top products
      prisma.orderItem.groupBy({
        by: ['productId', 'title'],
        where: { order: { createdAt: { gte: startDate } } },
        _sum: { quantity: true, price: true },
        take: 5,
        orderBy: { _sum: { quantity: 'desc' } },
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),

      // Recent orders
      prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          status: true,
          paymentStatus: true,
          customerEmail: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalOrders,
        totalRevenue: totalRevenue._sum?.totalAmount || 0,
        totalCustomers,
        averageOrderValue: averageOrderValue._avg?.totalAmount || 0,
      },
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        title: p.title,
        quantity: p._sum?.quantity || 0,
        revenue: p._sum?.price || 0,
      })),
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      recentOrders,
      period: days,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
