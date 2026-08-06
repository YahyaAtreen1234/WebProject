'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredAdminToken } from '@/lib/clientAuth';

interface ContactReply {
  id: string;
  message: string;
  type: string;
  createdAt: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  status: string;
  createdAt: string;
  replies: ContactReply[];
}

type Filter = 'all' | 'new' | 'replied' | 'closed';

const FILTERS: Filter[] = ['all', 'new', 'replied', 'closed'];

export default function AdminMessages() {
  const router = useRouter();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<Filter>('new');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 5000);
  };

  const authHeaders = useCallback(() => {
    const token = getStoredAdminToken();
    if (!token) {
      router.push('/admin/login');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }, [router]);

  const fetchMessages = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) return;

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filter !== 'all') params.set('status', filter);

      const response = await fetch(`/api/admin/messages?${params}`, { headers });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || `Could not load messages (${response.status})`);
      }

      setMessages(body.data || []);
      setTotalPages(body.pagination?.totalPages || 1);
      setTotal(body.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, filter, page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /** Patches `read` / `status`, keeping list and detail pane in sync. */
  const patchMessage = async (
    id: string,
    payload: { read?: boolean; status?: string },
    successNote?: string
  ) => {
    const headers = authHeaders();
    if (!headers) return;

    setError('');

    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || 'Could not update the message');
      }

      const updated: ContactMessage = body.data;
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
      setSelected((prev) => (prev?.id === id ? { ...prev, ...updated } : prev));

      if (successNote) flash(successNote);

      // A status change can move the message out of the active filter.
      if (payload.status && filter !== 'all' && payload.status !== filter) {
        fetchMessages();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the message');
    }
  };

  const openMessage = (message: ContactMessage) => {
    setSelected(message);
    setReplyText('');
    setError('');
    // Opening a message is what "reading" means; the toggle below can undo it.
    if (!message.read) {
      patchMessage(message.id, { read: true });
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;

    const headers = authHeaders();
    if (!headers) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/messages/${selected.id}/replies`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || 'Could not send the reply');
      }

      setReplyText('');

      if (body.emailSkipped) {
        flash('Reply saved. Email was not sent — SMTP is not configured on this deployment.');
      } else if (body.emailed) {
        flash(`Reply sent to ${selected.email}.`);
      } else {
        flash('Reply saved, but the email could not be delivered. Follow up manually.');
      }

      // Re-read the thread so the new reply and "replied" status appear.
      const detail = await fetch(`/api/admin/messages/${selected.id}`, { headers });
      if (detail.ok) {
        const detailBody = await detail.json();
        setSelected(detailBody.data);
      }
      fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message permanently? This cannot be undone.')) return;

    const headers = authHeaders();
    if (!headers) return;

    setError('');

    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers,
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || 'Could not delete the message');
      }

      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelected((prev) => (prev?.id === id ? null : prev));
      flash('Message deleted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the message');
    }
  };

  const statusClass = (status: string) =>
    ({
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      replied: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      closed: 'bg-midnight-700/50 text-midnight-300 border-midnight-600/50',
    }[status] || 'bg-midnight-700/50 text-midnight-300 border-midnight-600/50');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Messages</h2>
          <p className="text-sm text-midnight-400">
            Enquiries from the contact form. Replies are emailed to the customer.
          </p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                filter === status
                  ? 'bg-sapphire-600 text-white'
                  : 'bg-midnight-800 text-midnight-300 hover:bg-midnight-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300">
          {error}
        </div>
      )}
      {notice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-midnight-300">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="card-glass p-8 border border-sapphire-500/20 text-center">
              <p className="text-midnight-300">
                {filter === 'all' ? 'No messages yet.' : `No ${filter} messages.`}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                onClick={() => openMessage(message)}
                className={`card-glass p-4 border cursor-pointer transition-all ${
                  selected?.id === message.id
                    ? 'border-sapphire-500 bg-sapphire-500/10'
                    : 'border-sapphire-500/20 hover:border-sapphire-500/50'
                } ${!message.read ? 'bg-midnight-800/50' : ''}`}
              >
                <div className="flex justify-between items-start mb-2 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{message.subject}</h3>
                    <p className="text-sm text-midnight-400">{message.name}</p>
                    <p className="text-xs text-midnight-500">{message.email}</p>
                  </div>
                  <div className="flex gap-2 flex-col items-end shrink-0">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold border ${statusClass(
                        message.status
                      )}`}
                    >
                      {message.status}
                    </span>
                    {!message.read && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gold-500/20 text-gold-400 border border-gold-500/30">
                        Unread
                      </span>
                    )}
                    {message.replies.length > 0 && (
                      <span className="text-xs text-midnight-500">
                        {message.replies.length}{' '}
                        {message.replies.length === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-midnight-300 line-clamp-2">{message.message}</p>
                <p className="text-xs text-midnight-500 mt-2">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 disabled:opacity-50 text-sm"
              >
                Previous
              </button>
              <span className="text-sm text-midnight-400">
                Page {page} of {totalPages} • {total} total
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 disabled:opacity-50 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div className="lg:col-span-1">
            <div className="card-glass p-6 border border-sapphire-500/20 sticky top-6 space-y-4">
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-xl font-bold text-white">Message Details</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="px-2 py-1 text-midnight-400 hover:text-white text-sm"
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 pb-4 border-b border-midnight-700">
                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Subject</p>
                  <p className="text-white text-sm font-semibold">{selected.subject}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">From</p>
                  <p className="text-white text-sm">{selected.name}</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-sapphire-400 hover:text-sapphire-300 text-xs"
                  >
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <p className="text-midnight-400 text-xs">{selected.phone}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400 mb-2">Message</p>
                  <div className="bg-midnight-800/50 p-3 rounded text-sm text-midnight-200 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {selected.message}
                  </div>
                </div>
              </div>

              {selected.replies.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400 mb-2">Replies</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selected.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="bg-sapphire-500/10 border border-sapphire-500/20 p-2 rounded text-xs"
                      >
                        <p className="text-sapphire-400 font-semibold mb-1">Admin Reply</p>
                        <p className="text-midnight-200 whitespace-pre-wrap">{reply.message}</p>
                        <p className="text-midnight-500 text-xs mt-1">
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleReply} className="space-y-2 pt-4 border-t border-midnight-700">
                <label className="text-xs uppercase tracking-wide text-midnight-400">
                  Add Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply message..."
                  rows={3}
                  className="w-full px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded text-white text-sm placeholder-midnight-500 focus:border-sapphire-400 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="w-full px-3 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? 'Sending...' : 'Send Reply'}
                </button>
              </form>

              <div className="space-y-2 pt-4 border-t border-midnight-700">
                <button
                  onClick={() => patchMessage(selected.id, { read: !selected.read })}
                  className={`w-full px-3 py-2 rounded text-sm font-semibold transition-all ${
                    selected.read
                      ? 'bg-midnight-800 text-midnight-300 hover:bg-midnight-700'
                      : 'bg-gold-500/20 text-gold-400 hover:bg-gold-500/30'
                  }`}
                >
                  {selected.read ? '📨 Mark as Unread' : '👁️ Mark as Read'}
                </button>

                {selected.status === 'closed' ? (
                  <button
                    onClick={() => patchMessage(selected.id, { status: 'new' }, 'Message reopened.')}
                    className="w-full px-3 py-2 rounded text-sm font-semibold bg-sapphire-500/20 text-sapphire-300 hover:bg-sapphire-500/30 transition-all"
                  >
                    ↩️ Reopen
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      patchMessage(selected.id, { status: 'closed' }, 'Message closed.')
                    }
                    className="w-full px-3 py-2 rounded text-sm font-semibold bg-midnight-800 text-midnight-300 hover:bg-midnight-700 transition-all"
                  >
                    ✅ Close Message
                  </button>
                )}

                <button
                  onClick={() => handleDelete(selected.id)}
                  className="w-full px-3 py-2 rounded text-sm font-semibold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
