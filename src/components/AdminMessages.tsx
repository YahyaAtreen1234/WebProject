'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

interface ContactReply {
  id: string;
  message: string;
  type: string;
  createdAt: string;
}

export default function AdminMessages() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'replied' | 'closed'>('new');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (!savedToken) {
      router.push('/admin/login');
      return;
    }
    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchMessages();
    }
  }, [token, filter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/admin/messages?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string, currentRead: boolean) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          read: !currentRead,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(messages.map(m => m.id === messageId ? data.data : m));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/messages/${selectedMessage.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: replyText,
        }),
      });

      if (response.ok) {
        setReplyText('');
        fetchMessages();
        const messageResponse = await fetch(`/api/admin/messages/${selectedMessage.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (messageResponse.ok) {
          const data = await messageResponse.json();
          setSelectedMessage(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMessages(messages.filter(m => m.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      replied: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      closed: 'bg-midnight-700/50 text-midnight-300 border-midnight-600/50',
    };
    return colors[status] || 'bg-midnight-700/50 text-midnight-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Customer Messages</h2>
        <div className="flex gap-2">
          {(['all', 'new', 'replied', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-8 text-midnight-300">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="card-glass p-8 border border-sapphire-500/20 text-center">
              <p className="text-midnight-300">No messages found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`card-glass p-4 border cursor-pointer transition-all ${
                    selectedMessage?.id === message.id
                      ? 'border-sapphire-500 bg-sapphire-500/10'
                      : 'border-sapphire-500/20 hover:border-sapphire-500/50'
                  } ${!message.read ? 'bg-midnight-800/50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{message.subject}</h3>
                      <p className="text-sm text-midnight-400">{message.name}</p>
                      <p className="text-xs text-midnight-500">{message.email}</p>
                    </div>
                    <div className="flex gap-2 flex-col items-end">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                      {!message.read && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gold-500/20 text-gold-400 border-gold-500/30">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-midnight-300 line-clamp-2">{message.message}</p>
                  <p className="text-xs text-midnight-500 mt-2">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Details */}
        {selectedMessage && (
          <div className="lg:col-span-1">
            <div className="card-glass p-6 border border-sapphire-500/20 sticky top-6 space-y-4">
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-xl font-bold text-white">Message Details</h3>
                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="px-2 py-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded text-xs font-semibold transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 pb-4 border-b border-midnight-700">
                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Subject</p>
                  <p className="text-white text-sm font-semibold">{selectedMessage.subject}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">From</p>
                  <p className="text-white text-sm">{selectedMessage.name}</p>
                  <p className="text-midnight-400 text-xs">{selectedMessage.email}</p>
                  {selectedMessage.phone && (
                    <p className="text-midnight-400 text-xs">{selectedMessage.phone}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400 mb-2">Message</p>
                  <div className="bg-midnight-800/50 p-3 rounded text-sm text-midnight-200 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {selectedMessage.replies.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400 mb-2">Replies</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedMessage.replies.map((reply) => (
                      <div key={reply.id} className="bg-sapphire-500/10 border border-sapphire-500/20 p-2 rounded text-xs">
                        <p className="text-sapphire-400 font-semibold mb-1">Admin Reply</p>
                        <p className="text-midnight-200">{reply.message}</p>
                        <p className="text-midnight-500 text-xs mt-1">
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Reply Form */}
              <form onSubmit={handleAddReply} className="space-y-2 pt-4 border-t border-midnight-700">
                <label className="text-xs uppercase tracking-wide text-midnight-400">Add Reply</label>
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

              {/* Status */}
              <div className="space-y-2 pt-4 border-t border-midnight-700">
                <button
                  onClick={() => handleMarkAsRead(selectedMessage.id, selectedMessage.read)}
                  className={`w-full px-3 py-2 rounded text-sm font-semibold transition-all ${
                    selectedMessage.read
                      ? 'bg-midnight-800 text-midnight-400'
                      : 'bg-gold-500/20 text-gold-400 hover:bg-gold-500/30'
                  }`}
                >
                  {selectedMessage.read ? '👁️ Read' : '📨 Unread'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
