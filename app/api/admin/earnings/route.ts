import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

function verifyAdmin(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const payload = verifyToken(auth.substring(7)) as Record<string, unknown> | null;
    return payload?.isAdmin ? payload : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Sales figures come from our own paid orders, so the panel still reports
    // real numbers when Stripe is unreachable or not yet configured.
    const [allTime, thisMonth, pending, recent] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: 'succeeded' },
        _sum: { totalAmount: true, shipping: true, tax: true },
        _count: { _all: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: 'succeeded', createdAt: { gte: monthStart } },
        _sum: { totalAmount: true },
        _count: { _all: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: 'pending' },
        _sum: { totalAmount: true },
        _count: { _all: true },
      }),
      prisma.order.findMany({
        where: { paymentStatus: 'succeeded' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalAmount: true,
          createdAt: true,
        },
      }),
    ]);

    const sales = {
      grossAllTime: allTime._sum.totalAmount ?? 0,
      taxCollected: allTime._sum.tax ?? 0,
      shippingCollected: allTime._sum.shipping ?? 0,
      paidOrders: allTime._count._all,
      grossThisMonth: thisMonth._sum.totalAmount ?? 0,
      ordersThisMonth: thisMonth._count._all,
      awaitingPayment: pending._sum.totalAmount ?? 0,
      awaitingPaymentCount: pending._count._all,
      recent,
    };

    // Live payout state from Stripe. Reported as unconfigured rather than
    // failing the request, so the sales figures above always render.
    let payout: Record<string, unknown> = { configured: false };

    if (stripe) {
      try {
        const [balance, account, payouts] = await Promise.all([
          stripe.balance.retrieve(),
          stripe.accounts.retrieve(),
          stripe.payouts.list({ limit: 5 }),
        ]);

        const sumUsd = (entries: { amount: number; currency: string }[]) =>
          entries
            .filter((e) => e.currency === 'usd')
            .reduce((total, e) => total + e.amount, 0) / 100;

        const bank = account.external_accounts?.data?.[0] as
          | { bank_name?: string; last4?: string; currency?: string }
          | undefined;

        payout = {
          configured: true,
          available: sumUsd(balance.available),
          pending: sumUsd(balance.pending),
          payoutsEnabled: account.payouts_enabled ?? false,
          bank: bank
            ? { name: bank.bank_name ?? 'Bank account', last4: bank.last4 ?? '' }
            : null,
          schedule: account.settings?.payouts?.schedule?.interval ?? 'unknown',
          recent: payouts.data.map((p: { id: string; amount: number; status: string; arrival_date: number }) => ({
            id: p.id,
            amount: p.amount / 100,
            status: p.status,
            arrivalDate: new Date(p.arrival_date * 1000).toISOString(),
          })),
        };
      } catch (stripeError) {
        console.error('[earnings] Stripe lookup failed:', stripeError);
        payout = {
          configured: true,
          error:
            stripeError instanceof Error
              ? stripeError.message
              : 'Could not reach Stripe',
        };
      }
    }

    return NextResponse.json({ sales, payout });
  } catch (error) {
    console.error('[earnings] Error:', error);
    return NextResponse.json({ error: 'Failed to load earnings' }, { status: 500 });
  }
}
