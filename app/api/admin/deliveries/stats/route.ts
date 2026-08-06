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

const STATUSES = ['pending', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];

export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [grouped, shippingTotals, delivered] = await Promise.all([
      prisma.delivery.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.delivery.aggregate({
        _sum: { totalShippingCost: true },
        _count: { _all: true },
      }),
      // Only completed deliveries can contribute to an average transit time.
      prisma.delivery.findMany({
        where: { status: 'delivered', actualDelivery: { not: null } },
        select: { createdAt: true, actualDelivery: true },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    STATUSES.forEach((status) => {
      byStatus[status] = 0;
    });
    grouped.forEach((row) => {
      byStatus[row.status] = row._count._all;
    });

    // Mean days from creation to delivery. Null rather than 0 when nothing has
    // been delivered yet, so the UI can say "no data" instead of implying zero.
    let averageDeliveryTime: number | null = null;
    if (delivered.length > 0) {
      const totalDays = delivered.reduce((sum, d) => {
        const ms = new Date(d.actualDelivery as Date).getTime() - new Date(d.createdAt).getTime();
        return sum + ms / (1000 * 60 * 60 * 24);
      }, 0);
      averageDeliveryTime = Number((totalDays / delivered.length).toFixed(1));
    }

    const byCarrier = await prisma.delivery.groupBy({
      by: ['carrier'],
      _count: { _all: true },
      _sum: { totalShippingCost: true },
    });

    return NextResponse.json({
      total: shippingTotals._count._all,
      pending: byStatus.pending,
      picked: byStatus.picked,
      inTransit: byStatus.in_transit,
      outForDelivery: byStatus.out_for_delivery,
      delivered: byStatus.delivered,
      failed: byStatus.failed,
      totalShippingRevenue: shippingTotals._sum.totalShippingCost ?? 0,
      averageDeliveryTime,
      carriers: byCarrier
        .map((c) => ({
          carrier: c.carrier,
          count: c._count._all,
          revenue: c._sum.totalShippingCost ?? 0,
        }))
        .sort((a, b) => b.count - a.count),
    });
  } catch (error) {
    console.error('[DeliveryStatsAPI] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery stats' }, { status: 500 });
  }
}
