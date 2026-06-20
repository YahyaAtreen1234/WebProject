'use client';

import { useState, useEffect } from 'react';

interface CustomOrder {
  id: string;
  customOrderNumber: string;
  customerName: string;
  description: string;
  status: string;
  budget?: number;
  quotedPrice?: number;
  createdAt: string;
}

export default function CustomOrders() {
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    description: '',
    budget: '',
    deadline: '',
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('user_token');
    setToken(savedToken || '');
    if (savedToken) {
      fetchOrders(savedToken);
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseFloat(formData.budget) : null,
        }),
      });

      if (response.ok) {
        fetchOrders(token);
        setShowForm(false);
        setFormData({
          customerName: '',
          customerEmail: '',
          description: '',
          budget: '',
          deadline: '',
        });
        alert('Custom order request submitted successfully!');
      }
    } catch (error) {
      console.error('Failed to submit order:', error);
      alert('Failed to submit order request');
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

  if (!token) {
    return (
      <div className="card-glass p-8 border border-sapphire-500/20 text-center">
        <p className="text-midnight-300 mb-4">Sign in to request custom orders</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Custom Orders</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700"
        >
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {showForm && (
        <div className="card-glass p-6 border border-sapphire-500/20">
          <h3 className="text-xl font-bold text-white mb-4">Request Custom Order</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                required
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                required
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
            </div>

            <textarea
              placeholder="Describe what you're looking for..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={4}
              className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Budget (optional)"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                step="0.01"
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
              <input
                type="date"
                placeholder="Deadline (optional)"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-midnight-300">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="card-glass p-8 border border-sapphire-500/20 text-center">
          <p className="text-midnight-300">No custom orders yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="card-glass p-4 border border-sapphire-500/20 hover:border-sapphire-500/50"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-white font-semibold">{order.customerName}</h3>
                  <p className="text-sm text-midnight-400 font-mono">
                    {order.customOrderNumber}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-midnight-300 mb-3">{order.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-midnight-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                {order.quotedPrice && (
                  <span className="text-sapphire-400 font-semibold">
                    Quote: ${order.quotedPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}