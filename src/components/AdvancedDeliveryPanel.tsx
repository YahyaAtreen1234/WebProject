'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredAdminToken } from '@/lib/clientAuth';

interface DeliveryStats {
  total: number;
  pending: number;
  picked: number;
  inTransit: number;
  outForDelivery: number;
  delivered: number;
  failed: number;
  totalShippingRevenue: number;
  averageDeliveryTime: number | null;
  carriers: { carrier: string; count: number; revenue: number }[];
}

interface Delivery {
  id: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  currentLocation: string | null;
  totalShippingCost: number;
  estimatedDelivery: string | null;
  order: {
    id: string;
    customerName: string;
    totalAmount: number;
  };
}

const STATUSES = ['pending', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];

const STATUS_META: Record<string, { label: string; icon: string; className: string }> = {
  pending: { label: 'Pending', icon: '📦', className: 'bg-gray-500/20 text-gray-300' },
  picked: { label: 'Picked', icon: '🏪', className: 'bg-blue-500/20 text-blue-300' },
  in_transit: { label: 'In Transit', icon: '🚚', className: 'bg-sapphire-500/20 text-sapphire-300' },
  out_for_delivery: { label: 'Out for Delivery', icon: '🚗', className: 'bg-gold-500/20 text-gold-300' },
  delivered: { label: 'Delivered', icon: '✅', className: 'bg-emerald-500/20 text-emerald-300' },
  failed: { label: 'Failed', icon: '❌', className: 'bg-rose-500/20 text-rose-300' },
};

const LIMIT = 20;

export default function AdvancedDeliveryPanel() {
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Inline status update
  const [editing, setEditing] = useState<Delivery | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [nextLocation, setNextLocation] = useState('');
  const [nextNote, setNextNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const token = getStoredAdminToken();
    if (!token) {
      setError('Not signed in as an admin. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (carrierFilter) params.set('carrier', carrierFilter);

      const [listRes, statsRes] = await Promise.all([
        fetch(`/api/admin/deliveries?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/deliveries/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!listRes.ok) {
        const body = await listRes.json().catch(() => ({}));
        throw new Error(body.error || `Could not load deliveries (${listRes.status})`);
      }

      const list = await listRes.json();
      setDeliveries(list.deliveries || []);
      setTotal(list.total || 0);
      setPages(list.pages || 0);

      // Stats are supporting detail: a failure there should not blank the table.
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load deliveries');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, carrierFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openEditor = (delivery: Delivery) => {
    setEditing(delivery);
    setNextStatus(delivery.status);
    setNextLocation(delivery.currentLocation || '');
    setNextNote('');
    setError('');
  };

  const submitStatus = async () => {
    if (!editing) return;
    if (!nextLocation.trim()) {
      setError('A location is required — it is recorded on the customer’s tracking page.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = getStoredAdminToken();
      const response = await fetch(`/api/admin/deliveries/${editing.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
          location: nextLocation.trim(),
          description: nextNote.trim() || undefined,
        }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Failed to update status');

      setSuccess(`${editing.trackingNumber} is now ${STATUS_META[nextStatus]?.label ?? nextStatus}.`);
      window.setTimeout(() => setSuccess(''), 4000);
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const statCards = stats
    ? [
        { label: 'Total', value: stats.total, tone: 'text-white' },
        { label: 'Pending', value: stats.pending, tone: 'text-gray-300' },
        { label: 'In Transit', value: stats.inTransit, tone: 'text-sapphire-300' },
        { label: 'Out for Delivery', value: stats.outForDelivery, tone: 'text-gold-300' },
        { label: 'Delivered', value: stats.delivered, tone: 'text-emerald-300' },
        { label: 'Failed', value: stats.failed, tone: 'text-rose-300' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Deliveries</h2>
          <p className="text-sm text-midnight-400">
            Track shipments and post status updates to customers.
          </p>
        </div>
        <Link
          href="/admin/deliveries/create"
          className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 font-semibold"
        >
          + Create Delivery
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300">
          {success}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="card-glass p-4 rounded-lg border border-sapphire-500/20"
              >
                <p className="text-xs text-midnight-400 mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${card.tone}`}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="card-glass p-4 rounded-lg border border-emerald-500/20">
              <p className="text-xs text-midnight-400 mb-1">Shipping Revenue</p>
              <p className="text-2xl font-bold text-emerald-300">
                ${stats.totalShippingRevenue.toFixed(2)}
              </p>
            </div>
            <div className="card-glass p-4 rounded-lg border border-gold-500/20">
              <p className="text-xs text-midnight-400 mb-1">Average Delivery Time</p>
              <p className="text-2xl font-bold text-gold-300">
                {stats.averageDeliveryTime === null
                  ? 'No data yet'
                  : `${stats.averageDeliveryTime} days`}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="card-glass p-4 rounded-lg border border-sapphire-500/20 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Search tracking #, order ID, or customer..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
        <select
          value={carrierFilter}
          onChange={(e) => {
            setCarrierFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
        >
          <option value="">All carriers</option>
          {(stats?.carriers ?? []).map((c) => (
            <option key={c.carrier} value={c.carrier}>
              {c.carrier} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card-glass p-4 rounded-lg border border-sapphire-500/20 overflow-x-auto">
        {loading ? (
          <p className="text-center py-12 text-midnight-300">Loading deliveries...</p>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-midnight-300 mb-2">No deliveries found.</p>
            <p className="text-sm text-midnight-500">
              {search || statusFilter || carrierFilter
                ? 'Try clearing the filters above.'
                : 'Create one from a confirmed order to get started.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-sapphire-500/20 text-left">
                <th className="py-3 px-3 text-sm font-semibold text-midnight-300">Tracking #</th>
                <th className="py-3 px-3 text-sm font-semibold text-midnight-300">Customer</th>
                <th className="py-3 px-3 text-sm font-semibold text-midnight-300">Carrier</th>
                <th className="py-3 px-3 text-sm font-semibold text-midnight-300">Status</th>
                <th className="py-3 px-3 text-sm font-semibold text-midnight-300">Location</th>
                <th className="py-3 px-3 text-sm font-semibold text-midnight-300">Shipping</th>
                <th className="py-3 px-3 text-sm font-semibold text-midnight-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => {
                const meta = STATUS_META[delivery.status] ?? {
                  label: delivery.status,
                  icon: '•',
                  className: 'bg-midnight-800 text-midnight-300',
                };
                return (
                  <tr
                    key={delivery.id}
                    className="border-b border-midnight-800 hover:bg-midnight-800/40"
                  >
                    <td className="py-3 px-3 text-sm font-mono text-sapphire-300">
                      {delivery.trackingNumber}
                    </td>
                    <td className="py-3 px-3 text-sm text-white">
                      {delivery.order?.customerName || '—'}
                    </td>
                    <td className="py-3 px-3 text-sm text-white">{delivery.carrier}</td>
                    <td className="py-3 px-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${meta.className}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-midnight-300">
                      {delivery.currentLocation || '—'}
                    </td>
                    <td className="py-3 px-3 text-sm text-gold-300">
                      ${delivery.totalShippingCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-sm space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => openEditor(delivery)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        Update
                      </button>
                      <Link
                        href={`/admin/deliveries/${delivery.id}`}
                        className="text-sapphire-400 hover:text-sapphire-300 font-semibold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-midnight-300 text-sm">
            Page {page} of {pages} • {total} total
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Status update modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-sapphire-500/30 bg-midnight-900 p-6">
            <h3 className="text-lg font-bold text-white mb-1">Update Delivery</h3>
            <p className="text-sm text-midnight-400 mb-6 font-mono">{editing.trackingNumber}</p>

            <label className="block text-sm text-midnight-300 mb-2">Status</label>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              className="w-full px-4 py-2 mb-4 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>

            <label className="block text-sm text-midnight-300 mb-2">Location *</label>
            <input
              type="text"
              value={nextLocation}
              onChange={(e) => setNextLocation(e.target.value)}
              placeholder="e.g. Memphis, TN"
              className="w-full px-4 py-2 mb-4 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
            />

            <label className="block text-sm text-midnight-300 mb-2">Note (optional)</label>
            <input
              type="text"
              value={nextNote}
              onChange={(e) => setNextNote(e.target.value)}
              placeholder="e.g. Held at customs"
              className="w-full px-4 py-2 mb-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
            />
            <p className="text-xs text-midnight-500 mb-6">
              Added to the customer&rsquo;s tracking history and queues a notification.
            </p>

            <div className="flex gap-3">
              <button
                onClick={submitStatus}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-semibold"
              >
                {saving ? 'Saving...' : 'Save Update'}
              </button>
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="px-4 py-2 bg-midnight-700 text-white rounded-lg hover:bg-midnight-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
