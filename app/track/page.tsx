'use client';

import { useState } from 'react';
import DeliveryTracking from '@/components/DeliveryTracking';

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="container-gutter section-spacing pt-gutter-lg">
        <div className="text-center mb-12">
          <h1 className="mb-4 text-4xl md:text-5xl">Track Your Delivery</h1>
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
                placeholder="Enter tracking number (e.g., TRK-2024-001234)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-6 py-4 rounded-lg bg-midnight-800/50 border border-sapphire-500/30 text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400 focus:ring-2 focus:ring-sapphire-400/50"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 btn-primary text-sm"
              >
                Track →
              </button>
            </div>
            <p className="text-sm text-midnight-400">
              💡 Tip: You can find your tracking number in your order confirmation email
            </p>
          </form>
        </div>
      </section>

      {/* Tracking Results */}
      {submitted && (
        <section className="container-gutter pb-gutter-lg">
          <DeliveryTracking trackingNumber={trackingNumber} />
        </section>
      )}

      {/* Info Section */}
      {!submitted && (
        <section className="container-gutter pb-gutter-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                Get SMS and email updates at every delivery milestone
              </p>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="bg-gradient-to-b from-transparent to-sapphire-900/10 section-spacing">
        <div className="container-gutter">
          <h2 className="text-center mb-12 text-3xl md:text-h3">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'How long does standard shipping take?',
                a: 'Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 day delivery.',
              },
              {
                q: 'Can I change my delivery address?',
                a: 'Yes, you can update your address within 24 hours of placing your order. Contact our support team for assistance.',
              },
              {
                q: 'Is my package insured?',
                a: 'All shipments are automatically insured for their full value. Optional additional insurance is available.',
              },
              {
                q: 'What if my package is delayed?',
                a: 'We monitor all shipments closely. If a delay occurs, we\'ll notify you immediately with a new estimated delivery date.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="card-glass backdrop-blur-md p-6 rounded-xl"
              >
                <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-midnight-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
