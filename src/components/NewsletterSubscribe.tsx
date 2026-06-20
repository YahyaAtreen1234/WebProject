'use client';

import { useState } from 'react';

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (response.ok) {
        setMessage('Successfully subscribed! Check your email for updates.');
        setEmail('');
        setName('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-glass p-6 border border-sapphire-500/20">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">Subscribe to Our Newsletter</h3>
        <p className="text-midnight-400 text-sm">
          Get updates on new products, exclusive deals, and more.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
        />

        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 disabled:opacity-50 font-semibold transition-colors"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>

        {message && (
          <p className="text-emerald-400 text-sm">{message}</p>
        )}
        {error && (
          <p className="text-rose-400 text-sm">{error}</p>
        )}
      </form>
    </div>
  );
}
