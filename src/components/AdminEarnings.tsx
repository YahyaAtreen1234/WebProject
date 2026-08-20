'use client';

import { useEffect, useState } from 'react';
import { getStoredAdminToken } from '@/lib/clientAuth';

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  createdAt: string;
}

interface Sales {
  grossAllTime: number;
  taxCollected: number;
  shippingCollected: number;
  paidOrders: number;
  grossThisMonth: number;
  ordersThisMonth: number;
  awaitingPayment: number;
  awaitingPaymentCount: number;
  recent: RecentOrder[];
}

interface Payout {
  configured: boolean;
  available?: number;
  pending?: number;
  payoutsEnabled?: boolean;
  bank?: { name: string; last4: string } | null;
  schedule?: string;
  recent?: { id: string; amount: number; status: string; arrivalDate: string }[];
  error?: string;
}

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function AdminEarnings() {
  const [sales, setSales] = useState<Sales | null>(null);
  const [payout, setPayout] = useState<Payout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const token = getStoredAdminToken();
        if (!token) throw new Error('Not signed in as an admin.');

        const response = await fetch('/api/admin/earnings', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error || 'Could not load earnings');

        setSales(body.sales);
        setPayout(body.payout);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load earnings');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <p className="text-center py-12 text-midnight-300">Loading earnings...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Earnings &amp; Payouts</h2>
        <p className="text-sm text-midnight-400">
          What customers have paid you, and what Stripe has sent to your bank.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300">
          {error}
        </div>
      )}

      {sales && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="card-glass p-4 rounded-lg border border-emerald-500/20">
              <p className="text-xs text-midnight-400 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-emerald-300">
                {money(sales.grossAllTime)}
              </p>
              <p className="text-xs text-midnight-500 mt-1">
                {sales.paidOrders} paid {sales.paidOrders === 1 ? 'order' : 'orders'}
              </p>
            </div>
            <div className="card-glass p-4 rounded-lg border border-sapphire-500/20">
              <p className="text-xs text-midnight-400 mb-1">This Month</p>
              <p className="text-2xl font-bold text-sapphire-300">
                {money(sales.grossThisMonth)}
              </p>
              <p className="text-xs text-midnight-500 mt-1">
                {sales.ordersThisMonth} {sales.ordersThisMonth === 1 ? 'order' : 'orders'}
              </p>
            </div>
            <div className="card-glass p-4 rounded-lg border border-gold-500/20">
              <p className="text-xs text-midnight-400 mb-1">Tax Collected</p>
              <p className="text-2xl font-bold text-gold-300">
                {money(sales.taxCollected)}
              </p>
              <p className="text-xs text-midnight-500 mt-1">Owed, not income</p>
            </div>
            <div className="card-glass p-4 rounded-lg border border-midnight-700">
              <p className="text-xs text-midnight-400 mb-1">Awaiting Payment</p>
              <p className="text-2xl font-bold text-midnight-200">
                {money(sales.awaitingPayment)}
              </p>
              <p className="text-xs text-midnight-500 mt-1">
                {sales.awaitingPaymentCount} unpaid
              </p>
            </div>
          </div>

          {/* Payout state */}
          <div className="card-glass p-6 rounded-lg border border-sapphire-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Your Payout Account</h3>

            {!payout?.configured ? (
              <div className="text-sm text-midnight-300 space-y-2">
                <p>Stripe is not configured, so no money can be collected yet.</p>
                <p className="text-midnight-500">
                  Set <code className="text-sapphire-300">STRIPE_SECRET_KEY</code> in your
                  environment variables to start taking payments.
                </p>
              </div>
            ) : payout.error ? (
              <div className="text-sm text-rose-300">
                Could not reach Stripe: {payout.error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-midnight-800/50 p-4 rounded-lg">
                    <p className="text-xs text-midnight-400 mb-1">Available to pay out</p>
                    <p className="text-xl font-bold text-emerald-300">
                      {money(payout.available ?? 0)}
                    </p>
                  </div>
                  <div className="bg-midnight-800/50 p-4 rounded-lg">
                    <p className="text-xs text-midnight-400 mb-1">Pending clearance</p>
                    <p className="text-xl font-bold text-gold-300">
                      {money(payout.pending ?? 0)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div>
                    <span className="text-midnight-400">Bank: </span>
                    <span className="text-white">
                      {payout.bank
                        ? `${payout.bank.name} ····${payout.bank.last4}`
                        : 'None connected'}
                    </span>
                  </div>
                  <div>
                    <span className="text-midnight-400">Schedule: </span>
                    <span className="text-white capitalize">{payout.schedule}</span>
                  </div>
                  <div>
                    <span className="text-midnight-400">Payouts: </span>
                    <span className={payout.payoutsEnabled ? 'text-emerald-300' : 'text-rose-300'}>
                      {payout.payoutsEnabled ? 'Enabled' : 'Not enabled'}
                    </span>
                  </div>
                </div>

                {payout.recent && payout.recent.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-midnight-400 mb-2">
                      Recent payouts
                    </p>
                    <div className="space-y-2">
                      {payout.recent.map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between items-center bg-midnight-800/40 px-4 py-2 rounded"
                        >
                          <span className="text-white text-sm">{money(p.amount)}</span>
                          <span className="text-xs text-midnight-400">
                            {p.status} · arrives{' '}
                            {new Date(p.arrivalDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-midnight-500 pt-2 border-t border-midnight-800">
                  Your bank details are held by Stripe, not this site. Change them in the{' '}
                  <a
                    href="https://dashboard.stripe.com/settings/payouts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sapphire-400 hover:text-sapphire-300 underline"
                  >
                    Stripe Dashboard
                  </a>
                  .
                </p>
              </div>
            )}
          </div>

          {/* Recent sales */}
          <div className="card-glass p-6 rounded-lg border border-sapphire-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Recent Paid Orders</h3>
            {sales.recent.length === 0 ? (
              <p className="text-midnight-400 text-sm">No paid orders yet.</p>
            ) : (
              <div className="space-y-2">
                {sales.recent.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center bg-midnight-800/40 px-4 py-3 rounded"
                  >
                    <div>
                      <p className="text-white text-sm font-mono">{order.orderNumber}</p>
                      <p className="text-xs text-midnight-400">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-300 font-semibold">
                        {money(order.totalAmount)}
                      </p>
                      <p className="text-xs text-midnight-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
