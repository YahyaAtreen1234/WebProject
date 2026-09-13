'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setStoredAdminAuth } from '@/lib/clientAuth';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('[AdminLogin] Starting login process...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      console.log('[AdminLogin] Login API response:', {
        hasToken: !!data.token,
        hasAdmin: !!data.admin,
        hasUser: !!data.user,
        adminEmail: data.admin?.email || data.user?.email,
      });

      const account = data.admin ?? data.user;

      if (!data.token || !account?.email) {
        console.error('[AdminLogin] Invalid login response - missing token or email');
        throw new Error(data.error || 'Login response was incomplete');
      }

      console.log('[AdminLogin] Storing auth data:', {
        email: account.email,
        name: account.name,
        role: account.role,
      });

      setStoredAdminAuth(data.token, {
        id: account.id,
        email: account.email,
        name: account.name || account.email,
        role: account.role || 'admin',
      });

      console.log('[AdminLogin] Auth stored successfully, redirecting to dashboard...');

      // Verify data was actually stored before redirecting
      const storedInfo = localStorage.getItem('adminInfo');
      const storedToken = localStorage.getItem('adminToken');
      console.log('[AdminLogin] Verification - Data in localStorage:', {
        hasToken: !!storedToken,
        storedInfo: storedInfo ? JSON.parse(storedInfo) : null,
      });

      router.push('/admin/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      console.error('[AdminLogin] Login error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="card-glass p-8 border border-sapphire-500/20">
          <h1 className="text-3xl font-display font-bold text-white text-center mb-2">
            Admin Panel
          </h1>
          <p className="text-midnight-400 text-center mb-8">
            Sign in to manage your store
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500 transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg font-semibold hover:from-sapphire-700 hover:to-sapphire-800 disabled:opacity-50 transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-midnight-400 text-sm mt-6">
            <Link href="/" className="text-sapphire-400 hover:text-sapphire-300">
              Back to Store
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
