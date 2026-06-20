'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  email: string;
  name: string;
  messages: Array<{
    id: string;
    message: string;
    senderType: string;
    senderName: string;
    createdAt: string;
  }>;
}

export default function AdminSupportTickets() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('open');
  const [formData, setFormData] = useState({
    status: '',
    priority: '',
    message: '',
  });

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
      fetchTickets();
    }
  }, [token, filter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/support/tickets?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: formData.status || selectedTicket.status,
          priority: formData.priority || selectedTicket.priority,
          message: formData.message,
          senderType: 'admin',
          senderName: 'Admin',
          senderEmail: 'admin@store.com',
        }),
      });

      if (response.ok) {
        fetchTickets();
        setSelectedTicket(null);
        setFormData({ status: '', priority: '', message: '' });
        alert('Ticket updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update ticket:', error);
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

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: 'bg-blue-500/20 text-blue-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-rose-500/20 text-rose-400',
      urgent: 'bg-rose-600/20 text-rose-300',
    };
    return colors[priority] || 'bg-midnight-700/50 text-midnight-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Support Tickets</h2>
        <div className="flex gap-2">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded text-sm font-semibold ${
                filter === status
                  ? 'bg-sapphire-600 text-white'
                  : 'bg-midnight-800 text-midnight-300 hover:bg-midnight-700'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-8 text-midnight-300">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="card-glass p-8 border border-sapphire-500/20 text-center">
              <p className="text-midnight-300">No tickets found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setFormData({ status: ticket.status, priority: ticket.priority, message: '' });
                  }}
                  className={`card-glass p-4 border cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'border-sapphire-500 bg-sapphire-500/10'
                      : 'border-sapphire-500/20 hover:border-sapphire-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{ticket.subject}</h3>
                      <p className="text-sm text-midnight-400 font-mono">{ticket.ticketNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-midnight-400">{ticket.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Details */}
        {selectedTicket && (
          <div className="lg:col-span-1">
            <div className="card-glass p-6 border border-sapphire-500/20 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">Ticket Details</h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-midnight-700">
                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Subject</p>
                  <p className="text-white text-sm">{selectedTicket.subject}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Customer</p>
                  <p className="text-white text-sm">{selectedTicket.name}</p>
                  <p className="text-midnight-400 text-xs">{selectedTicket.email}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Category</p>
                  <p className="text-white capitalize">{selectedTicket.category}</p>
                </div>

                {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-midnight-400 mb-2">Messages</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedTicket.messages.slice(0, 3).map((msg) => (
                        <div key={msg.id} className="bg-midnight-800/50 p-2 rounded text-xs">
                          <p className="text-sapphire-400 font-semibold">{msg.senderName}</p>
                          <p className="text-midnight-300 mt-1">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleUpdateTicket} className="space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-midnight-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded text-white text-sm"
                  >
                    <option value="">Keep Current</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_customer">Waiting Customer</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wide text-midnight-400">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded text-white text-sm"
                  >
                    <option value="">Keep Current</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wide text-midnight-400">Reply Message</label>
                  <textarea
                    placeholder="Type your response..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded text-white text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 font-semibold"
                >
                  Update Ticket
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}