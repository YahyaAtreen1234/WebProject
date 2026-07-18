'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerAuth() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      console.log('Customer login response payload:', data);

      const account = data.user ?? data.admin;
      if (!data.token || !account?.id || !account?.email) {
        throw new Error(data.error || 'Login response was incomplete');
      }

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(account));

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Account created! Logging you in...');
      setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });

      setTimeout(() => {
        setLoginForm({ email: registerForm.email, password: registerForm.password });
        setMode('login');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card-glass p-8 border border-sapphire-500/20 rounded-2xl">
          <h1 className="text-3xl font-display font-bold text-white text-center mb-2">StonesLand</h1>
          <p className="text-midnight-400 text-center mb-8">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-sapphire-600 text-white'
                  : 'bg-midnight-800 text-midnight-300 hover:bg-midnight-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-sapphire-600 text-white'
                  : 'bg-midnight-800 text-midnight-300 hover:bg-midnight-700'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-emerald-400 text-sm">{success}</p>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-400 outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-400 outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-500 font-semibold disabled:opacity-50 transition-all"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-400 outline-none transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-400 outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Password</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-400 outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-400 outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-500 font-semibold disabled:opacity-50 transition-all"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

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
