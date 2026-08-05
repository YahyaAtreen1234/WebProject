'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import { getStoredAdminToken } from '@/lib/clientAuth';

interface Banner {
  id: string;
  type: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  link?: string | null;
  buttonText?: string | null;
  bgColor?: string | null;
  active: boolean;
  sortOrder: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

const BANNER_TYPES = [
  {
    id: 'announcement',
    label: '📢 Announcement Bar',
    hint: 'Thin strip at the very top of every page. Rotates between messages.',
  },
  {
    id: 'hero',
    label: '🖼️ Homepage Carousel',
    hint: 'Large rotating banner at the top of the homepage.',
  },
  {
    id: 'promo',
    label: '🎯 Promo Banner',
    hint: 'Side-by-side image banners lower down the homepage.',
  },
];

const COLOR_PRESETS = [
  { label: 'Gold', value: 'from-yellow-400 to-amber-500' },
  { label: 'Blue', value: 'from-blue-400 to-cyan-500' },
  { label: 'Purple', value: 'from-purple-400 to-pink-500' },
  { label: 'Green', value: 'from-emerald-400 to-teal-500' },
  { label: 'Red', value: 'from-rose-400 to-red-500' },
  { label: 'White', value: 'from-white to-gray-300' },
];

const emptyForm = {
  type: 'hero',
  title: '',
  subtitle: '',
  image: '',
  link: '',
  buttonText: '',
  bgColor: 'from-yellow-400 to-amber-500',
  active: true,
  sortOrder: '0',
  startDate: '',
  endDate: '',
};

export default function AdminBanners() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const savedToken = getStoredAdminToken();
    if (!savedToken) {
      router.push('/admin/login');
      return;
    }
    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (token) fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filterType]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const savedToken = getStoredAdminToken() || token;
      if (!savedToken) {
        router.push('/admin/login');
        return;
      }

      const url = filterType ? `/api/admin/banners?type=${filterType}` : '/api/admin/banners';
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });

      const data = await response.json();
      if (response.ok) {
        setBanners(data.banners || []);
      } else {
        setError(data.error || 'Failed to load banners');
      }
    } catch (err) {
      setError('Error fetching banners.');
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) return setError('Title is required');
    if (!formData.type) return setError('Banner type is required');

    try {
      const savedToken = getStoredAdminToken() || token;
      if (!savedToken) {
        setError('Missing admin token. Please log in again.');
        router.push('/admin/login');
        return;
      }

      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim() || null,
          image: formData.image || null,
          link: formData.link.trim() || null,
          buttonText: formData.buttonText.trim() || null,
          bgColor: formData.bgColor || null,
          active: formData.active,
          sortOrder: parseInt(formData.sortOrder) || 0,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(`Banner ${editingId ? 'updated' : 'created'} successfully!`);
        fetchBanners();
        resetForm();
      } else {
        setError(data.error || 'Failed to save banner');
      }
    } catch (err) {
      setError('An error occurred: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const savedToken = getStoredAdminToken() || token;
      if (!savedToken) return;

      await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({ active: !banner.active }),
      });
      fetchBanners();
    } catch (err) {
      setError('Failed to toggle banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner? This cannot be undone.')) return;

    try {
      const savedToken = getStoredAdminToken() || token;
      if (!savedToken) return;

      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${savedToken}` },
      });

      if (response.ok) {
        setSuccess('Banner deleted.');
        fetchBanners();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete banner');
      }
    } catch (err) {
      setError('Error deleting banner.');
    }
  };

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData({
      type: banner.type,
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      link: banner.link || '',
      buttonText: banner.buttonText || '',
      bgColor: banner.bgColor || 'from-yellow-400 to-amber-500',
      active: banner.active,
      sortOrder: banner.sortOrder.toString(),
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId('');
    setFormData(emptyForm);
    setShowForm(false);
  };

  const inputClass =
    'w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500';

  const activeType = BANNER_TYPES.find((t) => t.id === formData.type);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Banners</h2>
          <p className="text-sm text-midnight-400 mt-1">
            Add, edit and schedule the banners shown across your site.
          </p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700"
        >
          {showForm ? 'Cancel' : '+ New Banner'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500 rounded text-rose-400">{error}</div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500 rounded text-emerald-400">
          {success}
        </div>
      )}

      {showForm && (
        <div className="card-glass p-6 border border-sapphire-500/20">
          <h3 className="text-lg font-bold text-white mb-4">
            {editingId ? 'Edit Banner' : 'Create New Banner'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Where should it show?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {BANNER_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t.id })}
                    className={`p-4 rounded-lg border text-left transition ${
                      formData.type === t.id
                        ? 'border-sapphire-500 bg-sapphire-500/20'
                        : 'border-midnight-700 bg-midnight-800 hover:border-sapphire-500/50'
                    }`}
                  >
                    <p className="text-white font-semibold text-sm">{t.label}</p>
                  </button>
                ))}
              </div>
              {activeType && <p className="text-xs text-midnight-400 mt-2">{activeType.hint}</p>}
            </div>

            <input
              type="text"
              placeholder={
                formData.type === 'announcement'
                  ? 'Message (e.g. Subscribe to our newsletter and get 10% off)'
                  : 'Banner headline (e.g. FREE WORLDWIDE SHIPPING)'
              }
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className={inputClass}
            />

            {formData.type !== 'announcement' && (
              <input
                type="text"
                placeholder="Subtitle (e.g. On all orders)"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className={inputClass}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Link URL (e.g. /shop)"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className={inputClass}
              />
              {formData.type !== 'announcement' && (
                <input
                  type="text"
                  placeholder="Button text (e.g. Shop Now)"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  className={inputClass}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Colour</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, bgColor: c.value })}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold bg-gradient-to-r ${c.value} ${
                      formData.bgColor === c.value
                        ? 'border-white text-black'
                        : 'border-transparent text-black/70 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.type !== 'announcement' && (
              <ImageUploader
                label="Banner Image"
                onImageSelect={(url) => setFormData({ ...formData, image: url })}
                currentImage={formData.image}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-midnight-400 mb-1">Start date (optional)</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-midnight-400 mb-1">End date (optional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-midnight-400 mb-1">Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <p className="text-xs text-midnight-400">
              Leave the dates empty to show the banner immediately and indefinitely. Lower order
              numbers appear first.
            </p>

            <label className="flex items-center gap-3 px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-white">Active — show this banner on the site</span>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                {editingId ? 'Update' : 'Create'} Banner
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

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterType('')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            filterType === '' ? 'bg-sapphire-600 text-white' : 'bg-midnight-800 text-midnight-300'
          }`}
        >
          All
        </button>
        {BANNER_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              filterType === t.id ? 'bg-sapphire-600 text-white' : 'bg-midnight-800 text-midnight-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-midnight-300">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 card-glass border border-sapphire-500/20">
          <p className="text-midnight-300 mb-2">No banners yet</p>
          <p className="text-sm text-midnight-500">
            Click &quot;+ New Banner&quot; to create your first one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="card-glass p-4 border border-sapphire-500/20 flex items-center gap-4"
            >
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-midnight-800 flex items-center justify-center flex-shrink-0">
                {banner.image ? (
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">
                    {banner.type === 'announcement' ? '📢' : banner.type === 'promo' ? '🎯' : '🖼️'}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-midnight-800 text-midnight-300 rounded text-xs">
                    {BANNER_TYPES.find((t) => t.id === banner.type)?.label || banner.type}
                  </span>
                  {banner.active ? (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-xs">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-midnight-700 text-midnight-400 rounded text-xs">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-white font-semibold truncate">{banner.title}</p>
                {banner.subtitle && (
                  <p className="text-midnight-400 text-sm truncate">{banner.subtitle}</p>
                )}
                {(banner.startDate || banner.endDate) && (
                  <p className="text-xs text-gold-400 mt-1">
                    📅 {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'now'}
                    {' → '}
                    {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'no end'}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(banner)}
                  className="px-3 py-1 bg-midnight-700 text-white rounded text-xs hover:bg-midnight-600"
                >
                  {banner.active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => startEdit(banner)}
                  className="px-3 py-1 bg-sapphire-600 text-white rounded text-xs hover:bg-sapphire-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="px-3 py-1 bg-rose-600 text-white rounded text-xs hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
