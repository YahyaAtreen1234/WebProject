'use client';

import { useCallback, useEffect, useState } from 'react';
import { getStoredAdminToken } from '@/lib/clientAuth';

interface FooterLink {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
  active: boolean;
}

interface FooterSection {
  id: string;
  title: string;
  sortOrder: number;
  active: boolean;
  links: FooterLink[];
}

interface Settings {
  siteName: string;
  siteTagline: string;
  email: string;
  phone: string;
  address: string;
  newsletterHeading: string;
  newsletterText: string;
  addressHeading: string;
  copyrightText: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  whatsappUrl: string;
}

const EMPTY_SETTINGS: Settings = {
  siteName: '',
  siteTagline: '',
  email: '',
  phone: '',
  address: '',
  newsletterHeading: '',
  newsletterText: '',
  addressHeading: '',
  copyrightText: '',
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  whatsappUrl: '',
};

const SOCIALS: { key: keyof Settings; label: string }[] = [
  { key: 'facebookUrl', label: 'Facebook' },
  { key: 'instagramUrl', label: 'Instagram' },
  { key: 'whatsappUrl', label: 'WhatsApp' },
  { key: 'youtubeUrl', label: 'YouTube' },
  { key: 'tiktokUrl', label: 'TikTok' },
  { key: 'twitterUrl', label: 'X / Twitter' },
  { key: 'linkedinUrl', label: 'LinkedIn' },
];

const input =
  'w-full px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white text-sm placeholder-midnight-500 focus:border-sapphire-400 outline-none';

export default function AdminFooter() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const [newColumn, setNewColumn] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { label: string; url: string }>>({});

  const flash = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const token = getStoredAdminToken();
    if (!token) {
      setError('Not signed in as an admin. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const [footerRes, settingsRes] = await Promise.all([
        fetch('/api/admin/footer', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!footerRes.ok) {
        const body = await footerRes.json().catch(() => ({}));
        throw new Error(body.error || `Could not load the footer (${footerRes.status})`);
      }

      const footer = await footerRes.json();
      setSections(footer.sections || []);

      if (settingsRes.ok) {
        const saved = await settingsRes.json();
        setSettings({
          ...EMPTY_SETTINGS,
          ...Object.fromEntries(
            Object.keys(EMPTY_SETTINGS).map((key) => [key, saved?.[key] ?? ''])
          ),
        } as Settings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the footer');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const send = async (url: string, options: RequestInit) => {
    const token = getStoredAdminToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'Request failed');
    return body;
  };

  const addColumn = async () => {
    if (!newColumn.trim()) return setError('Give the column a title first');
    try {
      await send('/api/admin/footer', {
        method: 'POST',
        body: JSON.stringify({ title: newColumn.trim() }),
      });
      setNewColumn('');
      flash('Column added');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the column');
    }
  };

  const addLink = async (sectionId: string) => {
    const draft = drafts[sectionId];
    if (!draft?.label?.trim() || !draft?.url?.trim()) {
      return setError('A link needs both a label and a URL');
    }
    try {
      await send('/api/admin/footer', {
        method: 'POST',
        body: JSON.stringify({ sectionId, label: draft.label, url: draft.url }),
      });
      setDrafts((prev) => ({ ...prev, [sectionId]: { label: '', url: '' } }));
      flash('Link added');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the link');
    }
  };

  const patch = async (id: string, payload: Record<string, unknown>) => {
    try {
      await send(`/api/admin/footer/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the change');
    }
  };

  const remove = async (id: string, kind: 'section' | 'link', confirmText: string) => {
    if (!confirm(confirmText)) return;
    try {
      await send(`/api/admin/footer/${id}?kind=${kind}`, { method: 'DELETE' });
      flash(kind === 'section' ? 'Column removed' : 'Link removed');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove it');
    }
  };

  const move = async (section: FooterSection, direction: -1 | 1) => {
    const ordered = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = ordered.findIndex((s) => s.id === section.id);
    const swapWith = ordered[index + direction];
    if (!swapWith) return;

    try {
      await Promise.all([
        send(`/api/admin/footer/${section.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sortOrder: swapWith.sortOrder }),
        }),
        send(`/api/admin/footer/${swapWith.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sortOrder: section.sortOrder }),
        }),
      ]);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reorder');
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    setError('');
    try {
      // siteName and siteTagline are required by the settings endpoint, so send
      // the values already on record rather than letting the request 400.
      await send('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          ...settings,
          siteName: settings.siteName || 'StonesLand',
          siteTagline: settings.siteTagline || 'Premium Gems & Minerals',
        }),
      });
      flash('Footer details saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSavingSettings(false);
    }
  };

  const field = (key: keyof Settings, label: string, placeholder = '', textarea = false) => (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-wide text-midnight-400">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={settings[key]}
          onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
          placeholder={placeholder}
          rows={3}
          className={input}
        />
      ) : (
        <input
          type="text"
          value={settings[key]}
          onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
          placeholder={placeholder}
          className={input}
        />
      )}
    </div>
  );

  if (loading) {
    return <p className="py-12 text-center text-midnight-300">Loading footer…</p>;
  }

  const ordered = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Footer</h2>
        <p className="mt-1 text-sm text-midnight-400">
          Everything shown at the bottom of your site. Columns, links, contact details and
          social profiles — all of it yours to set.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
          {success}
        </div>
      )}

      {/* Link columns */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Link columns</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newColumn}
              onChange={(e) => setNewColumn(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addColumn()}
              placeholder="New column title, e.g. Support"
              className={`${input} w-64`}
            />
            <button
              onClick={addColumn}
              className="whitespace-nowrap rounded-lg bg-sapphire-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sapphire-700"
            >
              + Add column
            </button>
          </div>
        </div>

        {ordered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-sapphire-500/30 p-10 text-center">
            <p className="text-midnight-300">No columns yet.</p>
            <p className="mt-1 text-sm text-midnight-500">
              Add one above — for example “Information”, “Support” or “Shopping”.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {ordered.map((section, index) => (
              <div
                key={section.id}
                className={`rounded-lg border p-5 ${
                  section.active
                    ? 'border-sapphire-500/20 bg-midnight-900/40'
                    : 'border-midnight-700 bg-midnight-900/20 opacity-60'
                }`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={section.title}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (value && value !== section.title) patch(section.id, { title: value });
                    }}
                    className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-base font-semibold text-white hover:border-sapphire-500/30 focus:border-sapphire-400 focus:outline-none"
                  />

                  <button
                    onClick={() => move(section, -1)}
                    disabled={index === 0}
                    title="Move left"
                    className="px-1.5 text-midnight-400 hover:text-white disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => move(section, 1)}
                    disabled={index === ordered.length - 1}
                    title="Move right"
                    className="px-1.5 text-midnight-400 hover:text-white disabled:opacity-30"
                  >
                    →
                  </button>
                  <button
                    onClick={() => patch(section.id, { active: !section.active })}
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      section.active
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-midnight-700 text-midnight-300'
                    }`}
                  >
                    {section.active ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    onClick={() =>
                      remove(
                        section.id,
                        'section',
                        section.links.length
                          ? `Delete “${section.title}” and its ${section.links.length} link(s)?`
                          : `Delete “${section.title}”?`
                      )
                    }
                    className="rounded bg-rose-500/20 px-2 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/30"
                  >
                    Delete
                  </button>
                </div>

                <ul className="mb-4 space-y-2">
                  {section.links.length === 0 && (
                    <li className="text-sm text-midnight-500">
                      No links yet — this column stays hidden on the site until it has one.
                    </li>
                  )}
                  {section.links.map((link) => (
                    <li key={link.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={link.label}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value && value !== link.label) patch(link.id, { kind: 'link', label: value });
                        }}
                        className={`${input} flex-1`}
                      />
                      <input
                        type="text"
                        defaultValue={link.url}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value && value !== link.url) patch(link.id, { kind: 'link', url: value });
                        }}
                        className={`${input} flex-1 font-mono text-xs`}
                      />
                      <button
                        onClick={() => patch(link.id, { kind: 'link', active: !link.active })}
                        title={link.active ? 'Visible — click to hide' : 'Hidden — click to show'}
                        className={`px-1.5 text-sm ${
                          link.active ? 'text-emerald-400' : 'text-midnight-500'
                        }`}
                      >
                        {link.active ? '●' : '○'}
                      </button>
                      <button
                        onClick={() => remove(link.id, 'link', `Remove “${link.label}”?`)}
                        className="px-1.5 text-rose-400 hover:text-rose-300"
                        title="Remove link"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2 border-t border-midnight-800 pt-3">
                  <input
                    type="text"
                    value={drafts[section.id]?.label || ''}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [section.id]: { ...(prev[section.id] || { url: '' }), label: e.target.value },
                      }))
                    }
                    placeholder="Link text"
                    className={`${input} flex-1`}
                  />
                  <input
                    type="text"
                    value={drafts[section.id]?.url || ''}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [section.id]: { ...(prev[section.id] || { label: '' }), url: e.target.value },
                      }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && addLink(section.id)}
                    placeholder="/shop"
                    className={`${input} flex-1 font-mono text-xs`}
                  />
                  <button
                    onClick={() => addLink(section.id)}
                    className="whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Subscribe + address + socials */}
      <section className="space-y-5 rounded-lg border border-sapphire-500/20 bg-midnight-900/40 p-6">
        <h3 className="text-lg font-semibold text-white">Subscribe, address &amp; social</h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-4">
            {field('newsletterHeading', 'Subscribe heading', 'Subscribe')}
            {field(
              'newsletterText',
              'Subscribe blurb',
              'Subscribe to our newsletter for new arrivals and offers.',
              true
            )}
          </div>

          <div className="space-y-4">
            {field('addressHeading', 'Address heading', 'Address')}
            {field('address', 'Postal address', 'Street, city, country', true)}
          </div>

          <div className="space-y-4">
            {field('email', 'Contact email', 'info@yoursite.com')}
            {field('phone', 'Contact phone', '+92 300 000 0000')}
          </div>

          <div className="space-y-4">
            {field('copyrightText', 'Closing line', `© ${new Date().getFullYear()} Your Company.`)}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-wide text-midnight-400">
            Social profiles — leave blank to hide the icon
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {SOCIALS.map((social) => (
              <div key={social.key}>
                <label className="mb-1 block text-xs text-midnight-500">{social.label}</label>
                <input
                  type="text"
                  value={settings[social.key]}
                  onChange={(e) => setSettings({ ...settings, [social.key]: e.target.value })}
                  placeholder="https://…"
                  className={input}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={savingSettings}
          className="rounded-lg bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {savingSettings ? 'Saving…' : 'Save footer details'}
        </button>
      </section>
    </div>
  );
}
