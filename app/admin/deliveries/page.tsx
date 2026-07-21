'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  createdAt: string;
}

interface Delivery {
  id: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  currentLocation: string;
  estimatedDelivery: string;
  order: Order;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500/20 text-gray-300',
  picked: 'bg-blue-500/20 text-blue-300',
  in_transit: 'bg-sapphire-500/20 text-sapphire-300',
  out_for_delivery: 'bg-gold-500/20 text-gold-300',
  delivered: 'bg-emerald-500/20 text-emerald-300',
  failed: 'bg-rose-500/20 text-rose-300',
};

const STATUS_ICONS: Record<string, string> = {
  pending: '📦',
  picked: '🏪',
  in_transit: '🚚',
  out_for_delivery: '🚗',
  delivered: '✅',
  failed: '❌',
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, [page, filter, search]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        ...(filter && { status: filter }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/deliveries?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deliveries');
      }

      const data = await response.json();
      setDeliveries(data.deliveries);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching deliveries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 via-midnight-900 to-sapphire-900/20">
      <div className="container-gutter section-spacing pt-gutter-lg">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Delivery Management</h1>
          <p className="text-midnight-300">Manage orders, track shipments, and update delivery status</p>
        </div>

        <div className="card-glass backdrop-blur-md p-6 rounded-2xl mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search tracking #, order ID, or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
            />

            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="picked">Picked</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>

            <Link
              href="/admin/deliveries/create"
              className="px-6 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg font-semibold hover:from-sapphire-700 hover:to-sapphire-800 transition-all text-center"
            >
              + Create Delivery
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg mb-8">
            <p className="text-rose-300">{error}</p>
          </div>
        )}

        <div className="card-glass backdrop-blur-md p-6 rounded-2xl overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-midnight-300">Loading deliveries...</p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-midnight-300">No deliveries found</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sapphire-500/20">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Tracking #</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Carrier</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="border-b border-midnight-800 hover:bg-midnight-800/50 transition-colors">
                      <td className="py-4 px-4 text-sm text-sapphire-300 font-mono">{delivery.trackingNumber}</td>
                      <td className="py-4 px-4 text-sm text-white">{delivery.order.id}</td>
                      <td className="py-4 px-4 text-sm text-white">{delivery.order.customerName}</td>
                      <td className="py-4 px-4 text-sm text-gold-300">${delivery.order.totalAmount.toFixed(2)}</td>
                      <td className="py-4 px-4 text-sm text-white">{delivery.carrier}</td>
                      <td className="py-4 px-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[delivery.status]}`}>
                          {STATUS_ICONS[delivery.status]} {delivery.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-midnight-300">{delivery.currentLocation || '-'}</td>
                      <td className="py-4 px-4 text-sm">
                        <Link
                          href={`/admin/deliveries/${delivery.id}`}
                          className="text-sapphire-400 hover:text-sapphire-300 font-semibold"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-midnight-700 border border-sapphire-500/30 text-white rounded-lg hover:border-sapphire-400 disabled:opacity-50"
                  >
                    ← Previous
                  </button>

                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        page === p
                          ? 'bg-sapphire-600 text-white'
                          : 'bg-midnight-700 border border-sapphire-500/30 text-white hover:border-sapphire-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(Math.min(pages, page + 1))}
                    disabled={page === pages}
                    className="px-4 py-2 bg-midnight-700 border border-sapphire-500/30 text-white rounded-lg hover:border-sapphire-400 disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-midnight-400">
          Showing {deliveries.length} of {total} deliveries • Page {page} of {pages}
        </div>
      </div>
    </div>
  );
}
