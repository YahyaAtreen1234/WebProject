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
    const type = searchParams.get('type');

    const banners = await prisma.banner.findMany({
      where: type ? { type } : {},
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ banners, total: banners.length });
  } catch (error) {
    console.error('[GET /api/admin/banners] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch banners';
    return NextResponse.json({ error: message }, { status: 500 });
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
      type,
      title,
      subtitle,
      image,
      link,
      buttonText,
      bgColor,
      active,
      sortOrder,
      startDate,
      endDate,
    } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Banner type and title are required' },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        type,
        title,
        subtitle: subtitle || null,
        image: image || null,
        link: link || null,
        buttonText: buttonText || null,
        bgColor: bgColor || null,
        active: active ?? true,
        sortOrder: Number.isFinite(Number(sortOrder)) ? parseInt(String(sortOrder)) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/banners] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create banner';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
