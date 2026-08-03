'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import { getStoredAdminToken } from '@/lib/clientAuth';

interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  category: string;
  featured: boolean;
  trackingNumber?: string;
  dealDeadline?: string;
  createdAt: string;
  totalSold?: number;
}

export default function AdminProducts() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    featured: false,
    trackingNumber: '',
    dealDeadline: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['Minerals', 'Crystals', 'Gemstones', 'Fossils', 'Jewelry'];

  useEffect(() => {
    const savedToken = getStoredAdminToken();
    if (!savedToken) {
      router.push('/admin/login');
      return;
    }
    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token, search, offset]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const savedToken = getStoredAdminToken() || token;
      if (!savedToken) {
        setError('Missing admin token. Please log in again.');
        router.push('/admin/login');
        return;
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setTotal(data.total);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error fetching products.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) return setError('Title is required');
    if (!formData.description.trim()) return setError('Description is required');
    if (!formData.price || isNaN(parseFloat(formData.price))) return setError('Price must be a valid number');
    if (!formData.category) return setError('Category is required');
    if (!formData.stock || isNaN(parseInt(formData.stock))) return setError('Stock must be a valid number');

    try {
      const savedToken = getStoredAdminToken() || token;
      if (!savedToken) {
        setError('Missing admin token. Please log in again.');
        router.push('/admin/login');
        return;
      }

      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `/api/admin/products/${editingId}`
        : '/api/admin/products';

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        image: formData.image || null,
        featured: formData.featured,
        trackingNumber: formData.trackingNumber || null,
        dealDeadline: formData.dealDeadline || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify(payload),
      });

      const errorData = await response.json();

      if (response.ok) {
        setSuccess(`Product ${editingId ? 'updated' : 'created'} successfully!`);
        fetchProducts();
        resetForm();
      } else {
        setError(errorData.error || 'Failed to save product');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError('An error occurred: ' + errorMsg);
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const savedToken = getStoredAdminToken() || token;
      if (!savedToken) {
        setError('Missing admin token. Please log in again.');
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${savedToken}` },
      });

      if (response.ok) {
        fetchProducts();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Error deleting product.');
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      description: '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: '',
      featured: product.featured,
      trackingNumber: product.trackingNumber || '',
      dealDeadline: product.dealDeadline ? product.dealDeadline.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId('');
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: '',
      featured: false,
      trackingNumber: '',
      dealDeadline: '',
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Products</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700"
        >
          {showForm ? 'Cancel' : '+ New Product'}
        </button>
      </div>

      {showForm && (
        <div className="card-glass p-6 border border-sapphire-500/20">
          <h3 className="text-lg font-bold text-white mb-4">
            {editingId ? 'Edit Product' : 'Create New Product'}
          </h3>
          {error && (
            <div className="mb-4 p-4 bg-rose-500/20 border border-rose-500 rounded text-rose-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-emerald-500/20 border border-emerald-500 rounded text-emerald-400">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Product Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
            />

            <textarea
              placeholder="Product Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 h-24"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                step="0.01"
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
            </div>

            <input
              type="text"
              placeholder="Tracking Number / SKU (e.g., SKU-001, TRACK-12345)"
              value={formData.trackingNumber}
              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
              className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
            />
            <p className="text-xs text-midnight-400">This tracking number will be shown to customers when they receive their order</p>

            <input
              type="date"
              placeholder="Deal Deadline (e.g., 15-day money back)"
              value={formData.dealDeadline}
              onChange={(e) => setFormData({ ...formData, dealDeadline: e.target.value })}
              className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
            />
            <p className="text-xs text-midnight-400">Optional: Set a deadline for a special promotion (will appear in carousel)</p>

            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <label className="flex items-center px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-white">Featured</span>
              </label>
            </div>

            <ImageUploader
              onImageSelect={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
              currentImage={formData.image}
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                {editingId ? 'Update' : 'Create'} Product
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

      <div className="card-glass p-4 border border-sapphire-500/20">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOffset(0);
          }}
          className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-midnight-300">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-midnight-400">
          No products found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-midnight-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-midnight-300">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-midnight-300">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-midnight-300">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-midnight-300">
                  Stock
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
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-midnight-800 hover:bg-midnight-800/50"
                >
                  <td className="px-4 py-3 text-white">{product.title}</td>
                  <td className="px-4 py-3 text-midnight-300">{product.category}</td>
                  <td className="px-4 py-3 font-semibold text-sapphire-400">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {product.stock}
                  </td>
                  <td className="px-4 py-3">
                    {product.stock > 0 ? (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs">
                        In Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-rose-500/20 text-rose-300 rounded text-xs">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => startEdit(product)}
                      className="px-3 py-1 bg-sapphire-600 text-white rounded text-xs hover:bg-sapphire-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
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

      {total > limit && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-midnight-300">
            {offset + 1}-{Math.min(offset + limit, total)} of {total}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= total}
            className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}