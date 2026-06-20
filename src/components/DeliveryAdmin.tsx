'use client';

import { useState, useEffect } from 'react';

interface Delivery {
  id: string;
  trackingNumber: string;
  orderId: string;
  carrier: string;
  status: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  totalShippingCost: number;
  createdAt: string;
}

export default function DeliveryAdmin() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const url = selectedStatus === 'all'
          ? '/api/deliveries'
          : `/api/deliveries?status=${selectedStatus}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setDeliveries(data);
      } catch (err) {
        console.error('Error fetching deliveries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [selectedStatus]);

  const statusBadgeColor: Record<string, string> = {
    pending: 'bg-gray-500/20 text-gray-300',
    picked: 'bg-blue-500/20 text-blue-300',
    in_transit: 'bg-sapphire-500/20 text-sapphire-300',
    out_for_delivery: 'bg-gold-500/20 text-gold-300',
    delivered: 'bg-emerald-500/20 text-emerald-300',
    failed: 'bg-rose-500/20 text-rose-300',
  };

  const statuses = ['all', 'pending', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedStatus === status
                ? 'bg-sapphire-600 text-white'
                : 'bg-midnight-800/50 border border-sapphire-500/30 text-midnight-300 hover:border-sapphire-400'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Deliveries Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <span>Loading deliveries...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sapphire-500/20">
                <th className="px-4 py-3 text-left text-sm font-bold text-white">
                  Tracking #
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white">
                  Carrier
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white">
                  Est. Delivery
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-white">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr
                  key={delivery.id}
                  className="border-b border-midnight-700 hover:bg-midnight-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <code className="text-sm text-sapphire-300 font-mono">
                      {delivery.trackingNumber}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white">{delivery.carrier}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        statusBadgeColor[delivery.status] ||
                        'bg-midnight-700 text-midnight-300'
                      }`}
                    >
                      {delivery.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-midnight-300">
                      {delivery.currentLocation || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-midnight-300">
                      {delivery.estimatedDelivery
                        ? new Date(delivery.estimatedDelivery).toLocaleDateString()
                        : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-gold-300">
                      ${delivery.totalShippingCost.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && deliveries.length === 0 && (
        <div className="text-center p-12 text-midnight-400">
          <p>No deliveries found</p>
        </div>
      )}
    </div>
  );
}
