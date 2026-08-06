import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendCustomOrderAlert } from '@/lib/email';

function getAuth(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    return verifyToken(auth.substring(7)) as Record<string, unknown> | null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const auth = getAuth(request);

  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    // Admins review every request; customers only ever see their own.
    //
    // This previously read `auth?.userId ? { userId: auth.userId } : {}`, which
    // got both cases wrong: an admin token carries its own userId, so the admin
    // panel filtered down to the admin's personal requests and always rendered
    // an empty list -- incoming customer requests never appeared. And a request
    // with no token fell through to `{}`, returning every customer's request to
    // an anonymous caller.
    const where: Record<string, unknown> = auth.isAdmin
      ? {}
      : { userId: auth.userId as string };

    if (status) where.status = status;

    const orders = await prisma.customOrder.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('[CustomOrders] Fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Deliberately open: guests must be able to request a piece without an
  // account. An auth token is used to attribute the request when present.
  const auth = getAuth(request);

  try {
    const body = await request.json();
    const { description, budget, deadline, items, customerName, customerEmail } = body;

    if (!description) {
      return NextResponse.json({ error: 'Description required' }, { status: 400 });
    }

    const email = customerEmail || (auth?.email as string) || '';
    if (!email) {
      return NextResponse.json(
        { error: 'An email address is required so we can reply to you' },
        { status: 400 }
      );
    }

    const order = await prisma.customOrder.create({
      data: {
        customOrderNumber: `CO_${Date.now()}`,
        userId: (auth?.userId as string) || undefined,
        customerName: customerName || (auth ? 'Registered User' : 'Guest'),
        customerEmail: email,
        description,
        budget,
        deadline,
        items: {
          create: items || [],
        },
      },
      include: { items: true },
    });

    // Alert the shop. Without this the request sits in the admin panel until
    // someone happens to look, which is how enquiries get missed. A mail
    // failure must not fail the submission -- the record is already saved.
    const alert = await sendCustomOrderAlert({
      customOrderNumber: order.customOrderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      description: order.description,
      budget: order.budget,
      deadline: order.deadline,
    });

    if (!alert.success) {
      console.error('[CustomOrders] Admin alert failed for', order.customOrderNumber);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('[CustomOrders] Create failed:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
