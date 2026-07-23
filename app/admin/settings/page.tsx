'use client';

import { useState, useEffect } from 'react';

interface Settings {
  id: string;
  siteName: string;
  siteTagline: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    siteName: '',
    siteTagline: '',
    logo: '',
    email: '',
    phone: '',
    address: '',
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      console.log('[SettingsPage] Fetching settings...');
      const response = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('[SettingsPage] Response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load settings');
      }

      const data = await response.json();
      console.log('[SettingsPage] Settings loaded:', data);
      setSettings(data);
      setFormData({
        siteName: data.siteName || '',
        siteTagline: data.siteTagline || '',
        logo: data.logo || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        instagramUrl: data.instagramUrl || '',
        facebookUrl: data.facebookUrl || '',
        twitterUrl: data.twitterUrl || '',
        linkedinUrl: data.linkedinUrl || '',
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error loading settings';
      console.error('[SettingsPage] Fetch error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.siteName || !formData.siteTagline) {
      setError('Website name and tagline are required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      console.log('[SettingsPage] Sending update:', formData);

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('[SettingsPage] Response status:', response.status);
      const data = await response.json();
      console.log('[SettingsPage] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSettings(data);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error updating settings';
      console.error('[SettingsPage] Update error:', errorMsg);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-white text-lg">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 via-midnight-900 to-sapphire-900/20">
      <div className="container-gutter section-spacing pt-gutter-lg max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Site Settings</h1>
          <p className="text-midnight-300">Manage your website configuration and contact information</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg mb-8">
            <p className="text-rose-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-8">
            <p className="text-emerald-400">{success}</p>
          </div>
        )}

        <div className="card-glass backdrop-blur-md p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Website Information Section */}
            <div className="border-b border-sapphire-500/20 pb-6">
              <h2 className="text-xl font-bold text-white mb-4">Website Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Website Name *
                  </label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500 transition-colors"
                    placeholder="StonesLand"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Website Tagline *
                  </label>
                  <input
                    type="text"
                    value={formData.siteTagline}
                    onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                    className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500 transition-colors"
                    placeholder="Premium Gems & Minerals"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Website Logo URL
                  </label>
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500 transition-colors"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="border-b border-sapphire-500/20 pb-6">
              <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500 transition-colors"
                    placeholder="contact@stonesland.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500 transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Business Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500 transition-colors"
                    placeholder="123 Gem Street, Mineral City, MC 12345"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="border-b border-sapphire-500/20 pb-6">
              <h2 className="text-xl font-bold text-white mb-4">Social Media</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500 transition-colors"
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500 transition-colors"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500 transition-colors"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500 transition-colors"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg font-semibold hover:from-sapphire-700 hover:to-sapphire-800 disabled:opacity-50 transition-all"
              >
                {saving ? 'Saving Settings...' : 'Save Settings'}
              </button>
              <button
                type="button"
                onClick={fetchSettings}
                className="px-6 py-3 bg-midnight-700 border border-sapphire-500/30 text-white rounded-lg font-semibold hover:border-sapphire-400 transition-all"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-midnight-900/50 rounded-lg border border-sapphire-500/20">
          <p className="text-sm text-midnight-400">
            💡 <strong>Tip:</strong> All changes are saved to the database immediately. Required fields are marked with an asterisk (*).
          </p>
        </div>
      </div>
    </div>
  );
}
