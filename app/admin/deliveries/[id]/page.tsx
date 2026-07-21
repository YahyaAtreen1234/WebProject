'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description?: string;
}

interface Delivery {
  id: string;
  trackingNumber: string;
  carrier: string;
  shippingMethod: string;
  status: string;
  currentLocation: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  trackingHistory: TrackingEvent[];
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
  };
}

const VALID_STATUSES = ['pending', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    status: '',
    location: '',
    latitude: '',
    longitude: '',
    description: '',
  });

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const fetchDelivery = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/deliveries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch delivery');
      const data = await response.json();
      setDelivery(data);
      setFormData({ status: data.status, location: data.currentLocation || '', latitude: data.latitude || '', longitude: data.longitude || '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.status || !formData.location) {
      setError('Status and location are required');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/deliveries/${id}/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formData.status,
          location: formData.location,
          latitude: formData.latitude || undefined,
          longitude: formData.longitude || undefined,
          description: formData.description || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      await fetchDelivery();
      setFormData({ ...formData, description: '' });
      alert('Status updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center"><p className="text-white">Loading...</p></div>;
  if (!delivery) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center"><p className="text-rose-400">Delivery not found</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 via-midnight-900 to-sapphire-900/20">
      <div className="container-gutter section-spacing pt-gutter-lg">
        <div className="mb-6">
          <Link href="/admin/deliveries" className="text-sapphire-400 hover:text-sapphire-300 mb-4 inline-block">← Back to Deliveries</Link>
          <h1 className="text-4xl font-bold text-white mb-2">{delivery.trackingNumber}</h1>
          <p className="text-midnight-300">Order ID: {delivery.order.id}</p>
        </div>

        {error && <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg mb-8"><p className="text-rose-300">{error}</p></div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-midnight-300 mb-2">Current Status</h3>
            <p className="text-2xl font-bold text-white capitalize">{delivery.status.replace('_', ' ')}</p>
          </div>
          <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-midnight-300 mb-2">Current Location</h3>
            <p className="text-xl text-white">{delivery.currentLocation || 'Not set'}</p>
          </div>
          <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-midnight-300 mb-2">Estimated Delivery</h3>
            <p className="text-xl text-gold-300">{delivery.estimatedDelivery ? new Date(delivery.estimatedDelivery).toLocaleDateString() : 'Not set'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Update Status</h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
                >
                  <option value="">Select Status</option>
                  {VALID_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Current location"
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="GPS latitude"
                    className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="GPS longitude"
                    className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Notes</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about this status update"
                  rows={3}
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full px-6 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg font-semibold hover:from-sapphire-700 hover:to-sapphire-800 disabled:opacity-50 transition-all"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>

          <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Order Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-midnight-300">Customer Name</p>
                <p className="text-lg font-semibold text-white">{delivery.order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-midnight-300">Email</p>
                <p className="text-lg font-semibold text-white">{delivery.order.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-midnight-300">Order Total</p>
                <p className="text-lg font-semibold text-gold-300">${delivery.order.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-midnight-300">Carrier</p>
                <p className="text-lg font-semibold text-white">{delivery.carrier}</p>
              </div>
              <div>
                <p className="text-sm text-midnight-300">Shipping Method</p>
                <p className="text-lg font-semibold text-white">{delivery.shippingMethod}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass backdrop-blur-md p-6 rounded-2xl mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Tracking History</h2>
          <div className="space-y-4">
            {delivery.trackingHistory.length === 0 ? (
              <p className="text-midnight-300">No tracking events yet</p>
            ) : (
              delivery.trackingHistory.map((event) => (
                <div key={event.id} className="pb-4 border-b border-sapphire-500/20 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white capitalize">{event.status.replace('_', ' ')}</p>
                      <p className="text-sm text-midnight-300 mt-1">{event.location}</p>
                      {event.description && <p className="text-sm text-midnight-300 mt-1">{event.description}</p>}
                    </div>
                    <p className="text-xs text-midnight-400">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
