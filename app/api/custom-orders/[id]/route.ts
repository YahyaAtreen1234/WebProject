import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function getAuth(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    return verifyToken(auth.substring(7)) as Record<string, unknown> | null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const order = await prisma.customOrder.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // A customer may only read their own request. Reported as 404 rather than
    // 403 so the endpoint does not confirm that someone else's id exists.
    if (!auth.isAdmin && order.userId !== auth.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('[CustomOrders] Fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Every field here -- status, admin notes, quoted and final price -- is the
  // shop's to set. The previous version called the auth helper and then threw
  // the result away, leaving pricing writable by anyone.
  const auth = getAuth(request);
  if (!auth?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, adminNotes, quotedPrice, finalPrice } = body;

    const order = await prisma.customOrder.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(adminNotes && { adminNotes }),
        ...(quotedPrice && { quotedPrice, quotedAt: new Date() }),
        ...(finalPrice && { finalPrice }),
      },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('[CustomOrders] Update failed:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuth(request);
  if (!auth?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.customOrder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CustomOrders] Delete failed:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
