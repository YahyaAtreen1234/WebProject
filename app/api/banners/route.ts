import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Public banner feed. Returns only banners the admin has switched on and that
 * are inside their scheduling window, so a banner can be queued up in advance
 * and expire on its own without anyone remembering to take it down.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        active: true,
        ...(type ? { type } : {}),
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('[GET /api/banners] Error:', error);
    // A banner failure must never take the page down — callers treat an empty
    // list as "no banners configured" and fall back to their static content.
    return NextResponse.json([]);
  }
}
