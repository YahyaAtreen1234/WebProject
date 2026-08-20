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

/**
 * Updates a section or a link. `kind` says which, since the two id spaces are
 * separate and a bare id is ambiguous.
 *
 * Deleting a section cascades to its links (see schema), which is why the UI
 * warns before removing a column that still has any.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { kind, title, label, url, active, sortOrder } = body;

    if (kind === 'link') {
      const link = await prisma.footerLink.update({
        where: { id: params.id },
        data: {
          ...(label !== undefined && { label: String(label).trim() }),
          ...(url !== undefined && { url: String(url).trim() }),
          ...(typeof active === 'boolean' && { active }),
          ...(typeof sortOrder === 'number' && { sortOrder }),
        },
      });
      return NextResponse.json(link);
    }

    const section = await prisma.footerSection.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(typeof active === 'boolean' && { active }),
        ...(typeof sortOrder === 'number' && { sortOrder }),
      },
    });
    return NextResponse.json(section);
  } catch (error) {
    console.error('[admin/footer] Update failed:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind');

    if (kind === 'link') {
      await prisma.footerLink.delete({ where: { id: params.id } });
    } else {
      await prisma.footerSection.delete({ where: { id: params.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/footer] Delete failed:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
