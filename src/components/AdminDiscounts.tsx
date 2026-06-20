'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Discount {
  id: string;
  code: string;
  type: string;
  value: number;
  description?: string;
  minOrderAmount: number;
  maxDiscount?: number;
  maxUses?: number;
  timesUsed: number;
  expiryDate?: string;
  active: boolean;
  createdAt: string;
}

export default function AdminDiscounts() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    description: '',
    minOrderAmount: 0,
    maxDiscount: '',
    maxUses: '',
    expiryDate: '',
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (!savedToken) {
      router.push('/admin/login');
      return;
    }
    setToken(savedToken);
    fetchDiscounts(savedToken);
  }, [router]);

  const fetchDiscounts = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/discounts', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDiscounts(data.discounts);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      code: formData.code,
      type: formData.type,
      value: parseFloat(formData.value.toString()),
      description: formData.description,
      minOrderAmount: parseFloat(formData.minOrderAmount.toString()),
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      expiryDate: formData.expiryDate || null,
    };

    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `/api/admin/discounts/${editingId}`
        : '/api/admin/discounts';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchDiscounts(token);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving discount:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;

    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchDiscounts(token);
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
    }
  };

  const startEdit = (discount: Discount) => {
    setEditingId(discount.id);
    setFormData({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      description: discount.description || '',
      minOrderAmount: discount.minOrderAmount,
      maxDiscount: discount.maxDiscount?.toString() || '',
      maxUses: discount.maxUses?.toString() || '',
      expiryDate: discount.expiryDate ? discount.expiryDate.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      description: '',
      minOrderAmount: 0,
      maxDiscount: '',
      maxUses: '',
      expiryDate: '',
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Discount Codes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700"
        >
          {showForm ? 'Cancel' : '+ New Discount'}
        </button>
      </div>

      {showForm && (
        <div className="card-glass p-6 border border-sapphire-500/20">
          <h3 className="text-lg font-bold text-white mb-4">
            {editingId ? 'Edit Discount' : 'Create Discount Code'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Code (e.g., SUMMER20)"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                required
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Value"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: parseFloat(e.target.value) })
                }
                required
                step="0.01"
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
              <input
                type="number"
                placeholder="Min Order Amount"
                value={formData.minOrderAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minOrderAmount: parseFloat(e.target.value),
                  })
                }
                step="0.01"
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
            </div>

            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
            />

            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Max Discount ($)"
                value={formData.maxDiscount}
                onChange={(e) =>
                  setFormData({ ...formData, maxDiscount: e.target.value })
                }
                step="0.01"
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
              <input
                type="number"
                placeholder="Max Uses"
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({ ...formData, maxUses: e.target.value })
                }
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                {editingId ? 'Update' : 'Create'} Discount
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-midnight-700 text-white rounded-lg hover:bg-midnight-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-midnight-300">Loading...</div>
      ) : discounts.length === 0 ? (
        <div className="text-center py-8 text-midnight-400">
          No discount codes yet. Create one to get started!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-midnight-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-midnight-300">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-midnight-300">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-midnight-300">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-midnight-300">
                  Used
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-midnight-300">
                  Expires
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-midnight-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-midnight-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount) => (
                <tr
                  key={discount.id}
                  className="border-b border-midnight-800 hover:bg-midnight-800/50"
                >
                  <td className="px-4 py-3 text-white font-mono">{discount.code}</td>
                  <td className="px-4 py-3 text-midnight-300">
                    <span className="px-2 py-1 bg-sapphire-500/20 text-sapphire-300 rounded text-xs">
                      {discount.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {discount.type === 'percentage'
                      ? `${discount.value}%`
                      : `$${discount.value}`}
                  </td>
                  <td className="px-4 py-3 text-midnight-300">
                    {discount.timesUsed}
                    {discount.maxUses && ` / ${discount.maxUses}`}
                  </td>
                  <td className="px-4 py-3 text-midnight-300">
                    {discount.expiryDate
                      ? new Date(discount.expiryDate).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        discount.active
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {discount.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => startEdit(discount)}
                      className="px-3 py-1 bg-sapphire-600 text-white rounded text-xs hover:bg-sapphire-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(discount.id)}
                      className="px-3 py-1 bg-rose-600 text-white rounded text-xs hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
