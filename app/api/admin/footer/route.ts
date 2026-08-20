import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function verifyAdmin(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) return null;
    const payload = verifyToken(auth.substring(7)) as Record<string, unknown> | null;
    return payload?.isAdmin ? payload : null;
  } catch {
    return null;
  }
}

/** Every section and link, active or not — the admin needs to see what is off. */
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sections = await prisma.footerSection.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { links: { orderBy: { sortOrder: 'asc' } } },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('[admin/footer] Fetch failed:', error);
    return NextResponse.json({ error: 'Failed to load footer' }, { status: 500 });
  }
}

/** Creates a section (no `sectionId`) or a link within one (`sectionId` given). */
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sectionId, title, label, url } = body;

    if (sectionId) {
      if (!label?.trim() || !url?.trim()) {
        return NextResponse.json(
          { error: 'A link needs both a label and a URL' },
          { status: 400 }
        );
      }

      const section = await prisma.footerSection.findUnique({ where: { id: sectionId } });
      if (!section) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }

      // Append to the end of the column rather than assuming a fixed length.
      const last = await prisma.footerLink.findFirst({
        where: { sectionId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });

      const link = await prisma.footerLink.create({
        data: {
          sectionId,
          label: label.trim(),
          url: url.trim(),
          sortOrder: (last?.sortOrder ?? -1) + 1,
        },
      });

      return NextResponse.json(link, { status: 201 });
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'A column needs a title' }, { status: 400 });
    }

    const last = await prisma.footerSection.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const section = await prisma.footerSection.create({
      data: { title: title.trim(), sortOrder: (last?.sortOrder ?? -1) + 1 },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('[admin/footer] Create failed:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
