import { useState, useEffect } from 'react';

interface SiteSettings {
  id: string;
  siteName: string;
  siteTagline: string;
  logo: string | null;
  favicon: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/public/settings', {
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Set default settings on error
        setSettings({
          id: 'main',
          siteName: 'StonesLand',
          siteTagline: 'Premium Gems & Minerals',
          logo: null,
          favicon: null,
          email: null,
          phone: null,
          address: null,
          instagramUrl: null,
          twitterUrl: null,
          facebookUrl: null,
          linkedinUrl: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
