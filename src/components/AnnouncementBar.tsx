'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Banner {
  id: string;
  title: string;
  link?: string | null;
  bgColor?: string | null;
}

/**
 * Thin strip pinned above the header. Cycles through whatever announcement
 * banners the admin has switched on, and renders nothing at all when there are
 * none — so the layout is unchanged until someone actually adds a message.
 */
export default function AnnouncementBar() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/banners?type=announcement')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setBanners(data);
      })
      .catch(() => {
        /* a missing announcement bar is not worth surfacing to the visitor */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;

    const timer = setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % banners.length);
        setFading(false);
      }, 400);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  if (!visible || banners.length === 0) return null;

  const current = banners[index];
  const gradient = current.bgColor || 'from-yellow-400 to-amber-500';

  const message = (
    <span
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-semibold transition-opacity duration-400 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {current.title}
    </span>
  );

  return (
    <div className="relative bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-center text-sm">
        {current.link ? (
          <Link href={current.link} className="hover:opacity-80 transition-opacity">
            {message}
          </Link>
        ) : (
          message
        )}

        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss announcement"
          className="absolute right-4 text-white/40 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
