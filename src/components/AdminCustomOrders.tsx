'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CustomOrder {
  id: string;
  customOrderNumber: string;
  customerName: string;
  customerEmail: string;
  description: string;
  status: string;
  budget?: number;
  quotedPrice?: number;
  createdAt: string;
}

export default function AdminCustomOrders() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    quotedPrice: '',
    adminNotes: '',
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (!savedToken) {
      router.push('/admin/login');
      return;
    }
    setToken(savedToken);
    fetchOrders(savedToken);
  }, [router]);

  const fetchOrders = async (authToken: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/custom-orders', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/custom-orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: formData.status || selectedOrder.status,
          quotedPrice: formData.quotedPrice ? parseFloat(formData.quotedPrice) : undefined,
          adminNotes: formData.adminNotes,
        }),
      });

      if (response.ok) {
        fetchOrders(token);
        setSelectedOrder(null);
        setFormData({ status: '', quotedPrice: '', adminNotes: '' });
        alert('Order updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      requested: 'bg-blue-500/20 text-blue-400',
      under_review: 'bg-yellow-500/20 text-yellow-400',
      quoted: 'bg-purple-500/20 text-purple-400',
      accepted: 'bg-emerald-500/20 text-emerald-400',
      in_progress: 'bg-sapphire-500/20 text-sapphire-400',
      completed: 'bg-emerald-600/20 text-emerald-300',
      rejected: 'bg-rose-500/20 text-rose-400',
    };
    return colors[status] || 'bg-midnight-700/50 text-midnight-300';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Custom Orders Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-8 text-midnight-300">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="card-glass p-8 border border-sapphire-500/20 text-center">
              <p className="text-midnight-300">No custom orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setFormData({ status: order.status, quotedPrice: order.quotedPrice?.toString() || ', adminNotes: ' });
                  }}
                  className={`card-glass p-4 border cursor-pointer transition-all ${
                    selectedOrder?.id === order.id
                      ? 'border-sapphire-500 bg-sapphire-500/10'
                      : 'border-sapphire-500/20 hover:border-sapphire-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-semibold">{order.customerName}</h3>
                      <p className="text-sm text-midnight-400 font-mono">{order.customOrderNumber}</p>
                      <p className="text-sm text-midnight-500">{order.customerEmail}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <div className="lg:col-span-1">
            <div className="card-glass p-6 border border-sapphire-500/20 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">Order Details</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Customer</p>
                  <p className="text-white">{selectedOrder.customerName}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Email</p>
                  <p className="text-white text-sm">{selectedOrder.customerEmail}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Description</p>
                  <p className="text-midnight-300 text-sm">{selectedOrder.description}</p>
                </div>

                {selectedOrder.budget && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-midnight-400">Budget</p>
                    <p className="text-sapphire-400 font-semibold">${selectedOrder.budget.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleUpdateOrder} className="space-y-3 border-t border-midnight-700 pt-4">
                <div>
                  <label className="text-xs uppercase tracking-wide text-midnight-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded text-white text-sm"
                  >
                    <option value="">Keep Current</option>
                    <option value="under_review">Under Review</option>
                    <option value="quoted">Quoted</option>
                    <option value="accepted">Accepted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wide text-midnight-400">Quoted Price</label>
                  <input
                    type="number"
                    placeholder="Enter quote"
                    value={formData.quotedPrice}
                    onChange={(e) => setFormData({ ...formData, quotedPrice: e.target.value })}
                    step="0.01"
                    className="w-full px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wide text-midnight-400">Admin Notes</label>
                  <textarea
                    placeholder="Internal notes"
                    value={formData.adminNotes}
                    onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded text-white text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 font-semibold"
                >
                  Update Order
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}