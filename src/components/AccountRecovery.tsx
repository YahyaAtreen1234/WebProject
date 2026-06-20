'use client';

import { useState } from 'react';
import Link from 'next/link';

type RecoveryStep = 'method' | 'email' | 'phone' | 'verify' | 'success';

export default function AccountRecovery() {
  const [step, setStep] = useState<RecoveryStep>('method');
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'phone' | ''>('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryInfo, setRecoveryInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleRecoveryMethodSelect = (method: 'email' | 'phone') => {
    setRecoveryMethod(method);
    setStep(method === 'email' ? 'email' : 'phone');
    setError('');
    setSuccess('');
  };

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
      setSuccess(`Recovery code sent to ${email}`);
      setTimeout(() => {
        setStep('verify');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send recovery code');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!phone) {
        throw new Error('Phone number is required');
      }

      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(phone)) {
        throw new Error('Invalid phone number format');
      }

      // Simulate API call
      const maskedPhone = phone.slice(-4).padStart(phone.length, '*');
      setSuccess(`Recovery code sent to ${maskedPhone}`);
      setTimeout(() => {
        setStep('verify');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send recovery code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!verificationCode) {
        throw new Error('Verification code is required');
      }

      if (verificationCode.length < 6) {
        throw new Error('Invalid verification code');
      }

      // Simulate API call - retrieve account info
      setRecoveryInfo('Account information retrieved successfully');
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
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
              <span className="text-3xl">🔓</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Account Recovery</h1>
          <p className="text-sapphire-300">Recover your email or password</p>
        </div>

        {/* Card */}
        <div className="card-glass backdrop-blur-md p-8 rounded-2xl border border-sapphire-500/20 shadow-2xl">
          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg animate-pulse">
              <p className="text-rose-300 text-sm">⚠️ {error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg animate-pulse">
              <p className="text-emerald-300 text-sm">✓ {success}</p>
            </div>
          )}

          {/* Step 1: Choose Recovery Method */}
          {step === 'method' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">How do you want to recover?</h2>
                <p className="text-midnight-300 text-sm">Choose your preferred recovery method</p>
              </div>

              {/* Recovery Options */}
              <button
                onClick={() => handleRecoveryMethodSelect('email')}
                className="w-full p-6 bg-gradient-to-br from-sapphire-600/20 to-sapphire-500/10 border border-sapphire-500/40 rounded-xl hover:border-sapphire-400 hover:bg-sapphire-500/20 transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📧</div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Recover via Email</h3>
                    <p className="text-sm text-midnight-300">
                      Get a recovery code sent to your email address
                    </p>
                    <p className="text-xs text-midnight-400 mt-2">
                      We'll help you find your account and reset your password
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRecoveryMethodSelect('phone')}
                className="w-full p-6 bg-gradient-to-br from-amethyst-600/20 to-amethyst-500/10 border border-amethyst-500/40 rounded-xl hover:border-amethyst-400 hover:bg-amethyst-500/20 transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📱</div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Recover via Phone</h3>
                    <p className="text-sm text-midnight-300">
                      Get a recovery code sent via SMS to your phone
                    </p>
                    <p className="text-xs text-midnight-400 mt-2">
                      Quick recovery using your registered phone number
                    </p>
                  </div>
                </div>
              </button>

              {/* Additional Help */}
              <div className="pt-4 border-t border-sapphire-500/20">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-sapphire-300 hover:text-sapphire-200 text-sm font-semibold flex items-center gap-2"
                >
                  {showOptions ? '▼' : '▶'} More recovery options
                </button>

                {showOptions && (
                  <div className="mt-4 space-y-3">
                    <Link
                      href="/admin/forgot-password"
                      className="block p-3 bg-midnight-800/30 border border-midnight-700 rounded-lg text-white hover:border-midnight-600 transition-all text-sm"
                    >
                      🔐 Reset Password Only
                    </Link>
                    <button
                      onClick={() => alert('Contact admin for account recovery assistance')}
                      className="w-full p-3 bg-midnight-800/30 border border-midnight-700 rounded-lg text-white hover:border-midnight-600 transition-all text-sm"
                    >
                      👨‍💼 Contact Support
                    </button>
                  </div>
                )}
              </div>

              {/* Back to Login */}
              <div className="text-center pt-4">
                <Link href="/admin/login" className="text-sapphire-300 hover:text-sapphire-200 text-sm">
                  ← Back to Login
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: Email Recovery */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">📧 Email Recovery</h2>
                <label className="block text-sm font-semibold text-white mb-2">
                  Email Address
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
                  Enter the email address associated with your account
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? '⏳ Sending...' : '📧 Send Recovery Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('method');
                  setEmail('');
                  setError('');
                }}
                className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white hover:border-sapphire-400 transition-all"
              >
                ← Choose Different Method
              </button>
            </form>
          )}

          {/* Step 3: Phone Recovery */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">📱 Phone Recovery</h2>
                <label className="block text-sm font-semibold text-white mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-amethyst-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-amethyst-400 disabled:opacity-50"
                  required
                />
                <p className="text-xs text-midnight-400 mt-2">
                  Enter your registered phone number (with country code)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? '⏳ Sending...' : '📱 Send Recovery Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('method');
                  setPhone('');
                  setError('');
                }}
                className="w-full px-4 py-3 bg-midnight-800/50 border border-amethyst-500/30 rounded-lg text-white hover:border-amethyst-400 transition-all"
              >
                ← Choose Different Method
              </button>
            </form>
          )}

          {/* Step 4: Verify Code */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">✓ Verify Code</h2>
                <p className="text-midnight-300 text-sm mb-4">
                  Enter the {recoveryMethod === 'email' ? 'verification code sent to your email' : 'SMS code sent to your phone'}
                </p>
                <label className="block text-sm font-semibold text-white mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-midnight-800/50 border border-emerald-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-emerald-400 text-center text-2xl tracking-widest disabled:opacity-50"
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
                onClick={() => {
                  setStep('method');
                  setVerificationCode('');
                  setError('');
                }}
                className="w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white hover:border-sapphire-400 transition-all text-sm"
              >
                ← Try Different Method
              </button>
            </form>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="text-6xl animate-bounce">✓</div>
              <div>
                <h3 className="text-2xl font-bold text-emerald-400 mb-2">Account Found!</h3>
                <p className="text-midnight-300 mb-4">
                  We've verified your identity and retrieved your account information.
                </p>
              </div>

              {/* Account Info Display */}
              <div className="bg-midnight-800/50 border border-emerald-500/30 rounded-lg p-4 text-left">
                <p className="text-sm text-midnight-400 mb-2">Your Account Details:</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-midnight-400">Email Address</p>
                    <p className="text-white font-mono">admin@stonesland.com</p>
                  </div>
                  <div>
                    <p className="text-xs text-midnight-400">Account Status</p>
                    <p className="text-emerald-300 font-semibold">✓ Active</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/admin/forgot-password"
                  className="block w-full px-4 py-3 btn-primary rounded-lg font-semibold text-center"
                >
                  🔐 Reset Password
                </Link>
                <Link
                  href="/admin/login"
                  className="block w-full px-4 py-3 bg-midnight-800/50 border border-sapphire-500/30 rounded-lg text-white hover:border-sapphire-400 transition-all font-semibold text-center"
                >
                  🔑 Go to Login
                </Link>
              </div>
            </div>
          )}

          {/* Security Info */}
          {step !== 'success' && (
            <div className="mt-8 pt-6 border-t border-sapphire-500/20">
              <p className="text-xs text-midnight-400 text-center">
                🔒 Your account recovery is secure and encrypted. Never share your recovery codes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
