'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TrackingData {
  trackingNumber: string;
  status: string;
  carrier: string;
  currentLocation: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  order: {
    id: string;
    customerName: string;
    totalAmount: number;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    createdAt: string;
  };
  trackingHistory: Array<{
    id: string;
    status: string;
    location: string;
    timestamp: string;
    description?: string;
  }>;
}

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/tracking?trackingNumber=${encodeURIComponent(trackingNumber)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Tracking number not found');
      }
      const data = await response.json();
      setTracking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching tracking information');
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-500/20 text-gray-300',
      picked: 'bg-blue-500/20 text-blue-300',
      in_transit: 'bg-sapphire-500/20 text-sapphire-300',
      out_for_delivery: 'bg-gold-500/20 text-gold-300',
      delivered: 'bg-emerald-500/20 text-emerald-300',
      failed: 'bg-rose-500/20 text-rose-300',
    };
    return colors[status] || 'bg-midnight-700 text-midnight-300';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '📦',
      picked: '🏪',
      in_transit: '🚚',
      out_for_delivery: '🚗',
      delivered: '✅',
      failed: '❌',
    };
    return icons[status] || '📦';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 via-midnight-900 to-sapphire-900/20">
      <div className="container-gutter section-spacing pt-gutter-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4 text-4xl md:text-5xl font-display text-gradient">Track Your Order</h1>
          <p className="text-lg text-midnight-200 max-w-2xl mx-auto">
            Enter your tracking number to see real-time updates on your precious gemstone delivery
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter tracking number (e.g., TRK-20260614-A1B2)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                className="w-full px-6 py-4 rounded-lg bg-midnight-800/50 border border-sapphire-500/30 text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400 focus:ring-2 focus:ring-sapphire-400/50 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Track →'}
              </button>
            </div>
            <p className="text-sm text-midnight-400">
              💡 Tip: You can find your tracking number in your order confirmation email
            </p>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
            <p className="text-rose-300">{error}</p>
          </div>
        )}

        {/* Tracking Results */}
        {tracking && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Status Overview */}
            <div className="card-glass backdrop-blur-md p-8 rounded-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-midnight-300 mb-2">Tracking Number</p>
                  <code className="text-xl font-mono text-sapphire-300">
                    {tracking.trackingNumber}
                  </code>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                    tracking.status
                  )}`}
                >
                  {getStatusIcon(tracking.status)} {tracking.status.replace('_', ' ')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-midnight-300 mb-2">Current Location</p>
                  <p className="text-lg text-white">
                    {tracking.currentLocation || 'Not available'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-midnight-300 mb-2">Carrier</p>
                  <p className="text-lg text-white">{tracking.carrier}</p>
                </div>
                <div>
                  <p className="text-sm text-midnight-300 mb-2">Estimated Delivery</p>
                  <p className="text-lg text-gold-300">
                    {new Date(tracking.estimatedDelivery).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {tracking.actualDelivery && (
                  <div>
                    <p className="text-sm text-midnight-300 mb-2">Delivered On</p>
                    <p className="text-lg text-emerald-300">
                      {new Date(tracking.actualDelivery).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Details */}
            <div className="card-glass backdrop-blur-md p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Order Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-midnight-300 mb-1">Order ID</p>
                  <code className="text-white font-mono">{tracking.order.id}</code>
                </div>
                <div>
                  <p className="text-sm text-midnight-300 mb-1">Order Date</p>
                  <p className="text-white">
                    {new Date(tracking.order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-midnight-300 mb-1">Recipient</p>
                  <p className="text-white">{tracking.order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-midnight-300 mb-1">Amount</p>
                  <p className="text-gold-300 font-bold">${tracking.order.totalAmount.toFixed(2)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-midnight-300 mb-1">Delivery Address</p>
                  <p className="text-white">
                    {tracking.order.address}, {tracking.order.city}, {tracking.order.postalCode},{' '}
                    {tracking.order.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card-glass backdrop-blur-md p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-8">Delivery Timeline</h2>
              <div className="space-y-6">
                {tracking.trackingHistory && tracking.trackingHistory.length > 0 ? (
                  tracking.trackingHistory.map((event, index) => (
                    <div key={event.id} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-sapphire-500/20 flex items-center justify-center text-xl border border-sapphire-500/50">
                          {getStatusIcon(event.status)}
                        </div>
                        {index < tracking.trackingHistory.length - 1 && (
                          <div className="w-1 h-12 bg-gradient-to-b from-sapphire-500/50 to-transparent mt-2"></div>
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm font-bold text-sapphire-300">
                          {event.status.replace('_', ' ')}
                        </p>
                        <p className="text-white font-semibold">{event.location}</p>
                        {event.description && (
                          <p className="text-sm text-midnight-300 mt-1">{event.description}</p>
                        )}
                        <p className="text-xs text-midnight-400 mt-2">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-midnight-300">No tracking history available yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Section - shown when no tracking data */}
        {!tracking && !loading && (
          <section className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="card-glass backdrop-blur-md p-8 rounded-2xl text-center">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="font-bold text-white mb-2">Real-time Tracking</h3>
                <p className="text-sm text-midnight-300">
                  Track your package in real-time with GPS coordinates and location updates
                </p>
              </div>

              <div className="card-glass backdrop-blur-md p-8 rounded-2xl text-center">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="font-bold text-white mb-2">Multiple Carriers</h3>
                <p className="text-sm text-midnight-300">
                  Supported carriers: FedEx, UPS, DHL, and local delivery services
                </p>
              </div>

              <div className="card-glass backdrop-blur-md p-8 rounded-2xl text-center">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="font-bold text-white mb-2">Notifications</h3>
                <p className="text-sm text-midnight-300">
                  Get email and SMS updates at every delivery milestone
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-gradient-to-b from-transparent to-sapphire-900/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {[
                  {
                    q: 'How do I find my tracking number?',
                    a: 'Your tracking number was sent to you via email when your order shipped. Check your order confirmation email or contact our support team.',
                  },
                  {
                    q: 'What do the different statuses mean?',
                    a: 'Pending = processing, Picked = packed, In Transit = on the way, Out for Delivery = arriving today, Delivered = completed, Failed = delivery issue.',
                  },
                  {
                    q: 'How long does delivery take?',
                    a: 'Standard delivery takes 5-7 business days. Express delivery is 2-3 days. Overnight delivery available upon request.',
                  },
                  {
                    q: 'Can I change my delivery address?',
                    a: 'Contact support within 24 hours of order placement. Once shipped, address changes are not possible.',
                  },
                ].map((faq, i) => (
                  <div key={i} className="border-l-2 border-sapphire-500/30 pl-6">
                    <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                    <p className="text-sm text-midnight-300">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
