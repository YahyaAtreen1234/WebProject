'use client';

import { useState, useEffect } from 'react';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Delivery {
  id: string;
  trackingNumber: string;
  status: string;
  carrier: string;
  currentLocation: string;
  estimatedDelivery: string;
  order: Order;
}

interface ShippingFormData {
  carrier: string;
  shippingMethod: string;
  estimatedDays: string;
  shippingCost: string;
}

const CARRIERS = ['FedEx', 'UPS', 'DHL', 'Local Courier'];
const SHIPPING_METHODS = ['Standard', 'Express', 'Overnight', 'International'];
const STATUSES = ['pending', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];

export default function AdminTrackingManager() {
  const [unshippedOrders, setUnshippedOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'tracking'>('pending');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedTracking, setSelectedTracking] = useState<string | null>(null);
  const [shippingForm, setShippingForm] = useState<ShippingFormData>({
    carrier: 'FedEx',
    shippingMethod: 'Standard',
    estimatedDays: '5',
    shippingCost: '0',
  });
  const [updateForm, setUpdateForm] = useState({
    status: 'pending',
    location: '',
    latitude: '',
    longitude: '',
    description: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      // Fetch unshipped orders
      const ordersRes = await fetch('/api/orders?status=confirmed', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ordersData = await ordersRes.json();
      setUnshippedOrders(Array.isArray(ordersData) ? ordersData : []);

      // Fetch deliveries
      const deliveriesRes = await fetch('/api/admin/tracking', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deliveriesData = await deliveriesRes.json();
      setDeliveries(deliveriesData.deliveries || []);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async (orderId: string) => {
    try {
      setError('');
      setMessage('');
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`/api/orders/${orderId}/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carrier: shippingForm.carrier,
          shippingMethod: shippingForm.shippingMethod,
          estimatedDays: parseInt(shippingForm.estimatedDays),
          shippingCost: parseFloat(shippingForm.shippingCost),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to ship order');
      }

      const data = await response.json();
      setMessage(`Order shipped! Tracking: ${data.delivery.trackingNumber}`);
      setSelectedOrder(null);
      setShippingForm({
        carrier: 'FedEx',
        shippingMethod: 'Standard',
        estimatedDays: '5',
        shippingCost: '0',
      });

      // Refresh data
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ship order');
    }
  };

  const handleUpdateTracking = async (trackingNumber: string) => {
    try {
      setError('');
      setMessage('');
      const token = localStorage.getItem('adminToken');

      if (!updateForm.status || !updateForm.location) {
        setError('Status and location are required');
        return;
      }

      const response = await fetch(`/api/tracking/${trackingNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: updateForm.status,
          location: updateForm.location,
          latitude: updateForm.latitude ? parseFloat(updateForm.latitude) : undefined,
          longitude: updateForm.longitude ? parseFloat(updateForm.longitude) : undefined,
          description: updateForm.description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update tracking');
      }

      setMessage('Tracking updated successfully');
      setSelectedTracking(null);
      setUpdateForm({
        status: 'pending',
        location: '',
        latitude: '',
        longitude: '',
        description: '',
      });

      // Refresh data
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tracking');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-500/20 text-gray-300',
      confirmed: 'bg-blue-500/20 text-blue-300',
      picked: 'bg-blue-500/20 text-blue-300',
      in_transit: 'bg-sapphire-500/20 text-sapphire-300',
      out_for_delivery: 'bg-gold-500/20 text-gold-300',
      shipped: 'bg-sapphire-500/20 text-sapphire-300',
      delivered: 'bg-emerald-500/20 text-emerald-300',
      failed: 'bg-rose-500/20 text-rose-300',
    };
    return colors[status] || 'bg-midnight-700 text-midnight-300';
  };

  if (loading) {
    return (
      <div className="card-glass backdrop-blur-md p-8 rounded-2xl text-center">
        <p className="text-midnight-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'pending'
              ? 'bg-sapphire-600 text-white'
              : 'bg-midnight-800/50 border border-sapphire-500/30 text-midnight-300 hover:border-sapphire-400'
          }`}
        >
          📦 Pending Shipments ({unshippedOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'tracking'
              ? 'bg-sapphire-600 text-white'
              : 'bg-midnight-800/50 border border-sapphire-500/30 text-midnight-300 hover:border-sapphire-400'
          }`}
        >
          🚚 Active Tracking ({deliveries.length})
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <p className="text-emerald-300">{message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
          <p className="text-rose-300">{error}</p>
        </div>
      )}

      {/* Pending Shipments Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {unshippedOrders.length === 0 ? (
            <div className="card-glass backdrop-blur-md p-8 rounded-2xl text-center text-midnight-300">
              <p>No pending orders</p>
            </div>
          ) : (
            unshippedOrders.map((order) => (
              <div
                key={order.id}
                className="card-glass backdrop-blur-md p-6 rounded-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-midnight-300">Order ID</p>
                    <code className="text-white font-mono text-lg">{order.id}</code>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-midnight-300">Customer</p>
                    <p className="text-white">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-midnight-300">Email</p>
                    <p className="text-white text-sm">{order.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-midnight-300">Amount</p>
                    <p className="text-gold-300 font-bold">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-midnight-300">Order Date</p>
                    <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedOrder === order.id ? (
                  <div className="border-t border-sapphire-500/20 pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-midnight-300 mb-2 block">Carrier</label>
                        <select
                          value={shippingForm.carrier}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, carrier: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                        >
                          {CARRIERS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-midnight-300 mb-2 block">Method</label>
                        <select
                          value={shippingForm.shippingMethod}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, shippingMethod: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                        >
                          {SHIPPING_METHODS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-midnight-300 mb-2 block">Est. Days</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={shippingForm.estimatedDays}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, estimatedDays: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-midnight-300 mb-2 block">Cost ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={shippingForm.shippingCost}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, shippingCost: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShipOrder(order.id)}
                        className="flex-1 btn-primary py-2 rounded-lg"
                      >
                        ✓ Ship Order
                      </button>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="flex-1 px-4 py-2 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white hover:border-sapphire-400 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedOrder(order.id)}
                    className="w-full btn-primary py-2 rounded-lg"
                  >
                    Ship This Order
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Active Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="space-y-4">
          {deliveries.length === 0 ? (
            <div className="card-glass backdrop-blur-md p-8 rounded-2xl text-center text-midnight-300">
              <p>No active deliveries</p>
            </div>
          ) : (
            deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="card-glass backdrop-blur-md p-6 rounded-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-midnight-300">Tracking</p>
                    <code className="text-sapphire-300 font-mono">{delivery.trackingNumber}</code>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(delivery.status)}`}>
                    {delivery.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-midnight-300">Customer</p>
                    <p className="text-white">{delivery.order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-midnight-300">Carrier</p>
                    <p className="text-white">{delivery.carrier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-midnight-300">Location</p>
                    <p className="text-white">{delivery.currentLocation || 'Not updated'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-midnight-300">Est. Delivery</p>
                    <p className="text-gold-300">
                      {new Date(delivery.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedTracking === delivery.trackingNumber ? (
                  <div className="border-t border-sapphire-500/20 pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-midnight-300 mb-2 block">Status</label>
                        <select
                          value={updateForm.status}
                          onChange={(e) =>
                            setUpdateForm({ ...updateForm, status: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-400"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-midnight-300 mb-2 block">Location</label>
                        <input
                          type="text"
                          placeholder="e.g., New York, NY"
                          value={updateForm.location}
                          onChange={(e) =>
                            setUpdateForm({ ...updateForm, location: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-midnight-300 mb-2 block">Latitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          placeholder="Optional"
                          value={updateForm.latitude}
                          onChange={(e) =>
                            setUpdateForm({ ...updateForm, latitude: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-midnight-300 mb-2 block">Longitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          placeholder="Optional"
                          value={updateForm.longitude}
                          onChange={(e) =>
                            setUpdateForm({ ...updateForm, longitude: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm text-midnight-300 mb-2 block">Description</label>
                        <input
                          type="text"
                          placeholder="e.g., Package out for delivery"
                          value={updateForm.description}
                          onChange={(e) =>
                            setUpdateForm({ ...updateForm, description: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateTracking(delivery.trackingNumber)}
                        className="flex-1 btn-primary py-2 rounded-lg"
                      >
                        ✓ Update Tracking
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTracking(null);
                          setUpdateForm({
                            status: 'pending',
                            location: '',
                            latitude: '',
                            longitude: '',
                            description: '',
                          });
                        }}
                        className="flex-1 px-4 py-2 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white hover:border-sapphire-400 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedTracking(delivery.trackingNumber);
                      setUpdateForm({
                        status: delivery.status,
                        location: delivery.currentLocation || '',
                        latitude: '',
                        longitude: '',
                        description: '',
                      });
                    }}
                    className="w-full btn-primary py-2 rounded-lg"
                  >
                    Update Tracking
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
