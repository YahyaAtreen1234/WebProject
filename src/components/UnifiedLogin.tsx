'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UnifiedLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState('CapsLock'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend API for authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || '❌ Invalid email or password');
        return;
      }

      const data = await response.json();

      if (data.isAdmin) {
        // Admin login
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminInfo', JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role,
        }));
        router.push('/admin/dashboard');
      } else {
        // User login
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify({
          name: data.name,
          email: data.email,
        }));
        router.push('/user/dashboard');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@stonesland.com');
    setPassword('AdminPassword123!');
  };

  const handleDemoUser = () => {
    setEmail('john@example.com');
    setPassword('UserPassword123!');
  };

  return (
    <div className="min-h-screen bg-midnight-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card-glass p-8 border border-sapphire-500/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sapphire-400 via-amethyst-400 to-emerald-400 shadow-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💎</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">StonesLand</h1>
            <p className="text-midnight-400">Sign in to your account</p>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-3 bg-sapphire-500/10 border border-sapphire-500/30 rounded-lg">
            <p className="text-sapphire-300 text-sm">
              🔒 Your login is secure and encrypted
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-rose-300 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            {/* Email */}
            <div>
              <label className="block text-white font-semibold text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2.5 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-500 focus:outline-none transition-colors"
              />
              <p className="text-midnight-500 text-xs mt-1">Use your admin or user email</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white font-semibold text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-midnight-400 hover:text-white transition-colors"
                >
                  {showPassword ? '👁️ Hide' : '👁️ Show'}
                </button>
              </div>
              <p className="text-midnight-500 text-xs mt-1">Minimum 6 characters</p>

              {/* Caps Lock Warning */}
              {capsLock && (
                <p className="text-gold-400 text-xs mt-2">⚠️ Caps Lock is on</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg hover:from-sapphire-700 hover:to-sapphire-800 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>🔑</span>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Buttons */}
          <div className="space-y-2 mb-6">
            <p className="text-midnight-400 text-sm text-center">Demo Accounts:</p>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="w-full px-4 py-2 bg-amethyst-600/20 border border-amethyst-500/30 text-amethyst-300 rounded-lg hover:bg-amethyst-600/30 transition-colors font-semibold text-sm"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={handleDemoUser}
              className="w-full px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 rounded-lg hover:bg-emerald-600/30 transition-colors font-semibold text-sm"
            >
              👤 User Demo
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-midnight-700"></div>
            <span className="text-midnight-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-midnight-700"></div>
          </div>

          {/* Login Options */}
          <div className="space-y-2 mb-8">
            <p className="text-midnight-400 text-sm text-center">Login as:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => router.push('/admin/login')}
                className="px-4 py-2 bg-sapphire-600/20 border border-sapphire-500/30 text-sapphire-300 rounded-lg hover:bg-sapphire-600/30 transition-colors font-semibold text-sm"
              >
                Admin Only
              </button>
              <button
                type="button"
                onClick={() => router.push('/user')}
                className="px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 rounded-lg hover:bg-emerald-600/30 transition-colors font-semibold text-sm"
              >
                User Only
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="p-4 bg-midnight-800/30 rounded-lg border border-midnight-700">
            <p className="text-white font-semibold text-sm mb-3">📋 Demo Credentials:</p>
            <div className="space-y-2 text-xs text-midnight-300">
              <div>
                <p className="text-gold-400 font-semibold">Admin Account:</p>
                <p>📧 admin@stonesland.com</p>
                <p>🔐 AdminPassword123!</p>
              </div>
              <div className="pt-2 border-t border-midnight-600">
                <p className="text-emerald-400 font-semibold">User Account:</p>
                <p>📧 john@example.com</p>
                <p>🔐 UserPassword123!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-midnight-400 text-sm">
          <p>
            Don't have an account?{' '}
            <Link href="/" className="text-sapphire-400 hover:text-sapphire-300 font-semibold">
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
