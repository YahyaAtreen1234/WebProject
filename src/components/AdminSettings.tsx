'use client';

import { useState, useEffect } from 'react';

interface Settings {
  id: string;
  siteName: string;
  siteTagline: string;
  logo: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [formData, setFormData] = useState<Partial<Settings>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      setSettings(data);
      setFormData(data);
      if (data.logo) {
        setLogoPreview(data.logo);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Failed to load settings');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, logo: base64 }));
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updated = await response.json();
      setSettings(updated);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      window.location.reload();
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-midnight-800 rounded-lg border border-sapphire-500/20">
      <h1 className="text-3xl font-bold text-white mb-6">Site Settings</h1>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.includes('success') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Website Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Website Name
          </label>
          <input
            type="text"
            name="siteName"
            value={formData.siteName || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-midnight-700 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500 transition-colors"
            placeholder="Enter website name"
          />
        </div>

        {/* Website Tagline */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Website Tagline
          </label>
          <input
            type="text"
            name="siteTagline"
            value={formData.siteTagline || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-midnight-700 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500 transition-colors"
            placeholder="Enter website tagline"
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Website Logo
          </label>
          <div className="mb-4">
            {logoPreview && (
              <div className="mb-4 p-4 bg-midnight-700 rounded-lg border border-sapphire-500/30">
                <p className="text-sm text-midnight-400 mb-2">Logo Preview:</p>
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-24 w-24 object-contain"
                />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="w-full px-4 py-3 bg-midnight-700 border border-sapphire-500/30 rounded-lg text-white file:bg-sapphire-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4 focus:outline-none focus:border-sapphire-500 transition-colors"
          />
          <p className="text-xs text-midnight-400 mt-2">
            Supported formats: JPG, PNG, SVG, WebP (recommended size: 200x60px)
          </p>
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Contact Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-midnight-700 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500 transition-colors"
            placeholder="contact@example.com"
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-midnight-700 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500 transition-colors"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        {/* Contact Address */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Contact Address
          </label>
          <textarea
            name="address"
            value={formData.address || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-midnight-700 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500 transition-colors"
            placeholder="Enter business address"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg font-semibold hover:from-sapphire-700 hover:to-sapphire-800 disabled:opacity-50 transition-all"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
