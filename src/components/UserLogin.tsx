'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email.includes('@')) {
        throw new Error('Invalid email address');
      }
      if (!formData.password) {
        throw new Error('Password is required');
      }

      const response = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('userToken', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-midnight-400">Sign in to your account</p>
        </div>

        <div className="card-glass p-8 border border-sapphire-500/20">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-midnight-300 mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-midnight-300">Password *</label>
                <Link href="/forgot-password" className="text-xs text-sapphire-400 hover:text-sapphire-300">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg hover:from-sapphire-700 hover:to-sapphire-800 transition-all font-semibold disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center">
              <p className="text-midnight-400 text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-sapphire-400 hover:text-sapphire-300">
                  Create one
                </Link>
              </p>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-midnight-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-midnight-900 text-midnight-500">or</span>
            </div>
          </div>

          <Link
            href="/gallery"
            className="block w-full py-2 border border-sapphire-500/30 text-sapphire-400 rounded-lg hover:bg-sapphire-500/10 transition-colors font-semibold text-center"
          >
            Continue as Guest
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-midnight-500 text-sm">
            By logging in, you agree to our{' '}
            <Link href="/terms" className="text-sapphire-400 hover:text-sapphire-300">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
