'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
}

export default function CreateDeliveryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    orderId: '',
    carrier: 'FedEx',
    shippingMethod: 'Standard',
    estimatedDays: '5',
    shippingCost: '',
    insuranceCost: '',
    weight: '',
    dimensions: '',
    currentLocation: '',
    latitude: '',
    longitude: '',
    estimatedDelivery: '',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/orders?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Failed to fetch orders (${response.status})`);
      }
      const data = await response.json();

      // An order can only have one delivery (Delivery.orderId is unique), so
      // offering ones that already have a record just produces a failed submit.
      const ordersWithoutDelivery = (data.orders || []).filter(
        (order: Order & { delivery?: unknown }) => !order.delivery
      );
      setOrders(ordersWithoutDelivery);

      if (ordersWithoutDelivery.length === 0) {
        setError('No orders are awaiting a delivery record.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderId || !formData.carrier || !formData.shippingMethod || !formData.estimatedDays || !formData.shippingCost) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/deliveries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          estimatedDays: parseInt(formData.estimatedDays),
          shippingCost: parseFloat(formData.shippingCost),
          insuranceCost: formData.insuranceCost ? parseFloat(formData.insuranceCost) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          estimatedDelivery: formData.estimatedDelivery ? new Date(formData.estimatedDelivery).toISOString() : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create delivery');
      }

      const data = await response.json();
      alert(`Delivery created successfully! Tracking: ${data.trackingNumber}`);
      router.push('/admin/deliveries');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating delivery');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 via-midnight-900 to-sapphire-900/20">
      <div className="container-gutter section-spacing pt-gutter-lg max-w-4xl">
        <div className="mb-8">
          <Link href="/admin/deliveries" className="text-sapphire-400 hover:text-sapphire-300 mb-4 inline-block">← Back to Deliveries</Link>
          <h1 className="text-4xl font-bold text-white mb-2">Create Delivery</h1>
          <p className="text-midnight-300">Create a new delivery record for an order</p>
        </div>

        {error && <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg mb-8"><p className="text-rose-300">{error}</p></div>}

        <div className="card-glass backdrop-blur-md p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Order *</label>
              <select
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500 disabled:opacity-50"
              >
                <option value="">Select an order</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.id} - {order.customerName} (${order.totalAmount.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Carrier *</label>
                <select
                  value={formData.carrier}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                  className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
                >
                  <option value="FedEx">FedEx</option>
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL</option>
                  <option value="Local">Local Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Shipping Method *</label>
                <input
                  type="text"
                  value={formData.shippingMethod}
                  onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
                  placeholder="e.g., Standard, Express, Overnight"
                  className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Estimated Days *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                  className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={formData.estimatedDelivery}
                  onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Shipping Cost ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.shippingCost}
                  onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Insurance Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.insuranceCost}
                  onChange={(e) => setFormData({ ...formData, insuranceCost: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Dimensions</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="e.g., 10x10x10 cm"
                  className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Current Location</label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                placeholder="e.g., Warehouse A, New York"
                className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="e.g., 40.7128"
                  className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="e.g., -74.0060"
                  className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg font-semibold hover:from-sapphire-700 hover:to-sapphire-800 disabled:opacity-50 transition-all"
              >
                {submitting ? 'Creating...' : 'Create Delivery'}
              </button>
              <Link
                href="/admin/deliveries"
                className="px-6 py-3 bg-midnight-700 border border-sapphire-500/30 text-white rounded-lg font-semibold hover:border-sapphire-400 transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
