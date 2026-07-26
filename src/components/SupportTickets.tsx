'use client';

import { useState, useEffect } from 'react';
import { getStoredUserToken } from '@/lib/clientAuth';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  email: string;
  name: string;
  createdAt: string;
  messages?: Array<{
    id: string;
    message: string;
    senderType: string;
    senderName: string;
    createdAt: string;
  }>;
}

export default function SupportTickets() {
  const [token, setToken] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });

  useEffect(() => {
    const savedToken = getStoredUserToken();
    setToken(savedToken || '');
    fetchTickets(savedToken || '');
  }, []);

  const fetchTickets = async (authToken: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/support/tickets', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetail = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedTicket(data);
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchTickets(token);
        setShowForm(false);
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'general',
          message: '',
        });
        alert('Support ticket created successfully!');
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create support ticket');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      open: 'bg-blue-500/20 text-blue-400',
      in_progress: 'bg-yellow-500/20 text-yellow-400',
      waiting_customer: 'bg-purple-500/20 text-purple-400',
      resolved: 'bg-emerald-500/20 text-emerald-400',
      closed: 'bg-midnight-700/50 text-midnight-300',
    };
    return colors[status] || 'bg-midnight-700/50 text-midnight-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Help & Support</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700"
        >
          {showForm ? 'Cancel' : '+ New Ticket'}
        </button>
      </div>

      {showForm && (
        <div className="card-glass p-6 border border-sapphire-500/20">
          <h3 className="text-xl font-bold text-white mb-4">Create Support Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
              >
                <option value="general">General Inquiry</option>
                <option value="order">Order Issue</option>
                <option value="product">Product Question</option>
                <option value="technical">Technical Issue</option>
                <option value="refund">Refund Request</option>
                <option value="shipping">Shipping Question</option>
                <option value="other">Other</option>
              </select>
            </div>

            <textarea
              placeholder="Describe your issue..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
              rows={4}
              className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500"
            />

            <button
              type="submit"
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
            >
              Create Ticket
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-8 text-midnight-300">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="card-glass p-8 border border-sapphire-500/20 text-center">
              <p className="text-midnight-300">No support tickets</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => fetchTicketDetail(ticket.id)}
                  className={`card-glass p-4 border cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'border-sapphire-500 bg-sapphire-500/10'
                      : 'border-sapphire-500/20 hover:border-sapphire-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{ticket.subject}</h3>
                      <p className="text-sm text-midnight-400 font-mono">
                        {ticket.ticketNumber}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-midnight-400 text-sm">
                    {ticket.email} • {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        {selectedTicket && (
          <div className="lg:col-span-1">
            <div className="card-glass p-6 border border-sapphire-500/20 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">Ticket Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Subject</p>
                  <p className="text-white">{selectedTicket.subject}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getStatusColor(selectedTicket.status)}`}
                  >
                    {selectedTicket.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Category</p>
                  <p className="text-white capitalize">{selectedTicket.category}</p>
                </div>

                {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                  <div className="pt-4 border-t border-midnight-700">
                    <p className="text-xs uppercase tracking-wide text-midnight-400 mb-3">
                      Messages ({selectedTicket.messages.length})
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedTicket.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className="bg-midnight-800/50 p-2 rounded border border-midnight-700"
                        >
                          <p className="text-xs text-sapphire-400 font-semibold">
                            {msg.senderName}
                          </p>
                          <p className="text-sm text-midnight-300 mt-1">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}