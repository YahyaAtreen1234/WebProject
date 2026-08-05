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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle: subtitle || null }),
        ...(image !== undefined && { image: image || null }),
        ...(link !== undefined && { link: link || null }),
        ...(buttonText !== undefined && { buttonText: buttonText || null }),
        ...(bgColor !== undefined && { bgColor: bgColor || null }),
        ...(active !== undefined && { active }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(String(sortOrder)) || 0 }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('[PATCH /api/admin/banners/[id]] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update banner';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.banner.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/banners/[id]] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete banner';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
