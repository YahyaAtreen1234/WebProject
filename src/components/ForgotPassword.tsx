'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 'email' | 'verify' | 'reset' | 'success';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Simulate API call
      setSuccess(`Reset code sent to ${email}`);
      setTimeout(() => {
        setStep('verify');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!code) {
        throw new Error('Reset code is required');
      }

      if (code.length < 6) {
        throw new Error('Invalid reset code');
      }

      // Simulate API call
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!newPassword) {
        throw new Error('New password is required');
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Simulate API call
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-950 via-midnight-900 to-sapphire-900/30 flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sapphire-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-amethyst-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sapphire-400 via-amethyst-400 to-emerald-400 shadow-lg shadow-sapphire-500/50 flex items-center justify-center">
              <span className="text-3xl">🔐</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-sapphire-300">Recover your admin account</p>
        </div>

        {/* Card */}
        <div className="card-glass backdrop-blur-md p-8 rounded-2xl border border-sapphire-500/20 shadow-2xl">
          {/* Step Indicator */}
          <div className="mb-8 flex items-center justify-between">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step === 'email' || step === 'verify' || step === 'reset' || step === 'success' ? 'bg-sapphire-600 text-white' : 'bg-midnight-700 text-midnight-400'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 transition-all ${step === 'verify' || step === 'reset' || step === 'success' ? 'bg-sapphire-600' : 'bg-midnight-700'}`}></div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step === 'verify' || step === 'reset' || step === 'success' ? 'bg-sapphire-600 text-white' : 'bg-midnight-700 text-midnight-400'}`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 transition-all ${step === 'reset' || step === 'success' ? 'bg-sapphire-600' : 'bg-midnight-700'}`}></div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step === 'reset' || step === 'success' ? 'bg-sapphire-600 text-white' : 'bg-midnight-700 text-midnight-400'}`}>
              3
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <p className="text-rose-300 text-sm">⚠️ {error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-emerald-300 text-sm">✓ {success}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400 disabled:opacity-50"
                  required
                />
                <p className="text-xs text-midnight-400 mt-2">
                  We'll send a reset code to this email address
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? '⏳ Sending...' : '📧 Send Reset Code'}
              </button>

              <Link
                href="/admin/account-recovery"
                className="block w-full px-4 py-3 bg-amethyst-600/20 border border-amethyst-500/40 rounded-lg text-amethyst-300 hover:border-amethyst-400 hover:bg-amethyst-500/30 transition-all text-center font-semibold"
              >
                🔓 Try Another Way
              </Link>

              <div className="text-center">
                <Link href="/admin/login" className="text-sapphire-300 hover:text-sapphire-200 text-sm">
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 'verify' && (
            <form onSubmit={handleCodeSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Verification Code
                </label>
                <p className="text-xs text-midnight-400 mb-3">
                  Check your email for the 6-digit code
                </p>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400 text-center text-2xl tracking-widest disabled:opacity-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? '⏳ Verifying...' : '✓ Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white hover:border-sapphire-400 transition-all"
              >
                ← Use Different Email
              </button>

              <Link
                href="/admin/account-recovery"
                className="block w-full px-4 py-3 bg-amethyst-600/20 border border-amethyst-500/40 rounded-lg text-amethyst-300 hover:border-amethyst-400 hover:bg-amethyst-500/30 transition-all text-center font-semibold"
              >
                🔓 Try Another Way
              </Link>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400 disabled:opacity-50"
                  required
                />
                <p className="text-xs text-midnight-400 mt-2">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400 disabled:opacity-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
              </button>

              <Link
                href="/admin/account-recovery"
                className="block w-full px-4 py-3 bg-amethyst-600/20 border border-amethyst-500/40 rounded-lg text-amethyst-300 hover:border-amethyst-400 hover:bg-amethyst-500/30 transition-all text-center font-semibold"
              >
                🔓 Try Another Way
              </Link>
            </form>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="text-6xl">✓</div>
              <div>
                <h3 className="text-2xl font-bold text-emerald-400 mb-2">Password Reset!</h3>
                <p className="text-midnight-300">
                  Your password has been successfully reset. You can now login with your new password.
                </p>
              </div>

              <Link
                href="/admin/login"
                className="inline-block w-full btn-primary py-3 rounded-lg font-semibold text-center"
              >
                🔑 Go to Login
              </Link>
            </div>
          )}

          {/* Security Info */}
          {step !== 'success' && (
            <div className="mt-8 pt-6 border-t border-sapphire-500/20">
              <p className="text-xs text-midnight-400 text-center">
                🔒 This is a secure password reset process. Never share your reset code with anyone.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
