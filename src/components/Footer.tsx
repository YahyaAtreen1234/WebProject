'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

interface FooterSettings {
  siteName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  newsletterHeading?: string | null;
  newsletterText?: string | null;
  addressHeading?: string | null;
  copyrightText?: string | null;
  social?: Record<string, string | null | undefined>;
}

/** Inline SVG rather than emoji — emoji render differently per platform and read as filler. */
const SOCIAL_ICONS: Record<string, JSX.Element> = {
  facebook: <path d="M14 9h3V6h-3a4 4 0 0 0-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2a1 1 0 0 1 1-1Z" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17" cy="7" r="1" />
    </>
  ),
  whatsapp: (
    <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Zm4.3 12.5c-.2.5-1.1 1-1.5 1-.4 0-.9.2-3-.9s-3.3-3.4-3.5-3.6c-.1-.2-.7-1-.7-1.9s.5-1.3.7-1.5c.2-.2.4-.2.5-.2h.4c.1 0 .3 0 .5.4l.7 1.6c.1.2 0 .4 0 .5l-.3.4c-.1.1-.3.3-.1.6.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2 0 .4 0 .5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3v.6Z" />
  ),
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="M10.5 9.8v4.4l4-2.2Z" />
    </>
  ),
  tiktok: <path d="M14 3v10.5a3 3 0 1 1-2.5-3V13a.9.9 0 1 0 .9.9V3H14a4.6 4.6 0 0 0 4.3 4v2.4A7 7 0 0 1 14 7.8Z" />,
  twitter: <path d="M4 4l7 8.5L4.4 20H7l5.2-5.8L16.6 20H20l-7.3-8.9L19.6 4H17l-4.8 5.4L8.1 4Z" />,
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4" />
    </>
  ),
};

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  twitter: 'X',
  linkedin: 'LinkedIn',
};

export default function Footer() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [settings, setSettings] = useState<FooterSettings | null>(null);

  const [newsletter, setNewsletter] = useState('');
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/footer')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setSections(data.sections || []);
        setSettings(data.settings || null);
      })
      .catch(() => {
        /* the footer is chrome — a failure here should not disturb the page */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletter.trim()) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletter.trim() }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Previously a rejected address failed silently and the field just sat
        // there, so a duplicate or malformed email looked like a dead button.
        throw new Error(body.error || 'That did not go through. Please try again.');
      }

      setStatus({ kind: 'ok', text: 'Thanks — you are on the list.' });
      setNewsletter('');
    } catch (err) {
      setStatus({
        kind: 'error',
        text: err instanceof Error ? err.message : 'That did not go through.',
      });
    } finally {
      setSubmitting(false);
      window.setTimeout(() => setStatus(null), 5000);
    }
  };

  const social = Object.entries(settings?.social || {}).filter(
    ([platform, url]) => url && SOCIAL_ICONS[platform]
  ) as [string, string][];

  const addressLines = (settings?.address || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const hasContactColumn =
    addressLines.length > 0 || settings?.email || settings?.phone || social.length > 0;

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Link columns — Admin → Footer */}
          {sections.map((section) => (
            <div key={section.id}>
              <h4 className="mb-5 border-b border-white/15 pb-3 text-xs font-semibold uppercase tracking-widest">
                {section.title}
              </h4>
              <ul className="space-y-3 text-sm">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.url}
                      className="text-gray-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Subscribe */}
          <div>
            <h4 className="mb-5 border-b border-white/15 pb-3 text-xs font-semibold uppercase tracking-widest">
              {settings?.newsletterHeading || 'Subscribe'}
            </h4>

            {settings?.newsletterText && (
              <p className="mb-4 text-sm leading-relaxed text-gray-400">
                {settings.newsletterText}
              </p>
            )}

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <label htmlFor="footer-newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter"
                type="email"
                required
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                placeholder="Your email address"
                className="w-full rounded border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-white/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded border border-white/80 px-4 py-2.5 text-sm tracking-wide transition hover:bg-white hover:text-black disabled:opacity-50"
              >
                {submitting ? 'Joining…' : 'Join'}
              </button>
            </form>

            {status && (
              <p
                role="status"
                className={`mt-2 text-xs ${
                  status.kind === 'ok' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {status.text}
              </p>
            )}

            {social.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {social.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_LABELS[platform] || platform}
                    title={SOCIAL_LABELS[platform] || platform}
                    className="rounded-full border border-white/20 p-2 text-gray-400 transition-colors hover:border-white/60 hover:text-white"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {SOCIAL_ICONS[platform]}
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Address & contact */}
          {hasContactColumn && (
            <div>
              <h4 className="mb-5 border-b border-white/15 pb-3 text-xs font-semibold uppercase tracking-widest">
                {settings?.addressHeading || 'Address'}
              </h4>

              {addressLines.length > 0 && (
                <address className="mb-5 space-y-1 text-sm not-italic leading-relaxed text-gray-400">
                  {addressLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </address>
              )}

              <div className="space-y-2 text-sm">
                {settings?.email && (
                  <p>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-gray-400 transition-colors hover:text-white"
                    >
                      {settings.email}
                    </a>
                  </p>
                )}
                {settings?.phone && (
                  <p>
                    <a
                      href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}
                      className="text-gray-400 transition-colors hover:text-white"
                    >
                      {settings.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-8 text-center sm:px-6">
        <Logo variant="full" size={160} className="mb-5 inline-block" />
        <p className="text-xs text-gray-500">
          {settings?.copyrightText ||
            `© ${new Date().getFullYear()} ${settings?.siteName || 'StonesLand'}. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}
