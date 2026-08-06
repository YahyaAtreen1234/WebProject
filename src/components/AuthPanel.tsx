'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notifyUserAuthChanged, pruneEphemeralAuth, setAuthPersistence } from '@/lib/clientAuth';
import { verifyHuman, type HumanCheckPayload } from '@/lib/humanCheck';
import Logo from '@/components/Logo';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

type Mode = 'signin' | 'register' | 'verify';

interface AuthPanelProps {
  open: boolean;
  onClose: () => void;
  /** Which view the panel opens on. Defaults to the sign-in form. */
  initialMode?: Exclude<Mode, 'verify'>;
}

/* -------------------------------------------------------------------------- */
/*  reCAPTCHA v2 checkbox — only rendered when a site key is configured.       */
/* -------------------------------------------------------------------------- */

declare global {
  interface Window {
    grecaptcha?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => number;
      reset: (id?: number) => void;
    };
  }
}

function Recaptcha({ onChange }: { onChange: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    const render = () => {
      if (!containerRef.current || widgetId.current !== null || !window.grecaptcha) return;
      widgetId.current = window.grecaptcha.render(containerRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: onChange,
        'expired-callback': () => onChange(''),
      });
    };

    if (window.grecaptcha) {
      render();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-recaptcha]');
    if (existing) {
      existing.addEventListener('load', render);
      return () => existing.removeEventListener('load', render);
    }

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = 'true';
    script.addEventListener('load', render);
    document.head.appendChild(script);
  }, [onChange]);

  if (!RECAPTCHA_SITE_KEY) return null;

  return <div ref={containerRef} className="my-2" />;
}

/* -------------------------------------------------------------------------- */
/*  Small presentational helpers                                              */
/* -------------------------------------------------------------------------- */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[15px] text-gray-800 mb-2">
      {children} <span className="text-red-600">*</span>
    </label>
  );
}

const inputClass =
  'w-full px-5 py-3 border border-gray-300 rounded-full text-[15px] text-black placeholder-gray-400 focus:outline-none focus:border-gray-800 transition-colors';

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3.2" />
      {off && <line x1="3" y1="21" x2="21" y2="3" />}
    </svg>
  );
}

function PasswordField({
  value,
  onChange,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className={`${inputClass} pr-14`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panel                                                                     */
/* -------------------------------------------------------------------------- */

export default function AuthPanel({ open, onClose, initialMode = 'signin' }: AuthPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [showCaptcha, setShowCaptcha] = useState(true);

  // Sign in
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [remember, setRemember] = useState(false);

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Verify
  const [code, setCode] = useState('');

  const resetFeedback = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  const switchMode = useCallback(
    (next: Mode) => {
      resetFeedback();
      setMode(next);
      if (next !== 'verify') {
        loadCaptcha();
      }
    },
    [resetFeedback]
  );

  // The panel is portalled to <body>: the sticky header applies a CSS transform,
  // which would otherwise become the containing block for our fixed positioning.
  useEffect(() => {
    setMounted(true);
    pruneEphemeralAuth();
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    try {
      const response = await fetch('/api/captcha');
      if (response.ok) {
        const { token, question } = await response.json();
        setCaptchaToken(token);
        setCaptchaQuestion(question);
        setCaptchaAnswer('');
        setShowCaptcha(true);
      }
    } catch (error) {
      console.error('[AuthPanel] Failed to load captcha:', error);
    }
  };

  // Close on Escape, lock background scroll, focus the first field.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 250);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  // Start from the requested view each time the panel is opened.
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      resetFeedback();
    }
  }, [open, initialMode, resetFeedback]);

  // The error banner renders at the top of the scrolling body. On the register
  // form the submit button sits well below it, so a validation failure was
  // invisible from where the customer was actually looking — the form simply
  // appeared to do nothing.
  useEffect(() => {
    if (error) bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [error]);

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    if (!/[!@#$%^&*]/.test(password)) return 'Password must contain a special character (!@#$%^&*)';
    return '';
  };

  /**
   * Authenticates, persists the session and routes to the right dashboard.
   * Returns false (with `error` set) if the credentials were rejected.
   */
  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, captchaToken }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Invalid username or password');
      return false;
    }

    const account = data.admin ?? data.user;
    if (!data.token || !account?.id) {
      throw new Error('Login response was incomplete');
    }

    // Tokens always go to localStorage — that is where the rest of the app
    // reads them. "Remember me" only controls how long they survive.
    setAuthPersistence(rememberMe);
    const profile = JSON.stringify({
      id: account.id,
      name: account.name || account.email,
      email: account.email,
      role: account.role,
    });

    const isAdmin = data.isAdmin || account.role === 'admin';
    if (isAdmin) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminInfo', profile);
    }
    // The customer keys are always written: the header account menu and every
    // user-facing feature read them, admin or not.
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userInfo', profile);

    notifyUserAuthChanged();
    onClose();
    router.push(isAdmin ? '/admin/dashboard' : '/user/dashboard');
    router.refresh();
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    setLoading(true);
    try {
      const signedIn = await signIn(identifier, loginPassword, remember);
      if (!signedIn) return;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!regName.trim()) return setError('Name is required');
    if (!regEmail.includes('@')) return setError('Please enter a valid email address');
    if (regPassword !== regConfirm) return setError('Passwords do not match');

    const passwordError = validatePassword(regPassword);
    if (passwordError) return setError(passwordError);

    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      return setError('Please confirm you are not a robot.');
    }

    if (!RECAPTCHA_SITE_KEY) {
      if (!captchaToken || !captchaAnswer) {
        setError('Please complete the verification challenge.');
        return;
      }
      const humanCheck = await verifyHuman({
        captchaToken,
        captchaAnswer,
      });
      if (!humanCheck.ok) {
        setError(humanCheck.error || 'Verification failed. Please try again.');
        loadCaptcha();
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          captchaToken,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // When the server could not send a verification email it creates the
      // account already verified, and routing to the code screen would strand
      // the customer waiting on mail that will never arrive.
      if (data.verificationRequired === false) {
        const signedIn = await signIn(regEmail, regPassword, false);
        if (signedIn) return;

        setSuccess('Account created. You can sign in now.');
        setIdentifier(regEmail);
        setTimeout(() => switchMode('signin'), 1200);
        return;
      }

      setSuccess('Account created. Check your email for the verification code.');
      setMode('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!code.trim()) return setError('Verification code is required');

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, code }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      // Sign the new account in straight away — having just proved ownership
      // of the address and typed the password, being bounced back to a login
      // form is a pointless extra step.
      const signedIn = await signIn(regEmail, regPassword, false);
      if (signedIn) return;

      setSuccess('Email verified. You can sign in now.');
      setIdentifier(regEmail);
      setLoginPassword('');
      setRegPassword('');
      setRegConfirm('');
      setCode('');
      setTimeout(() => switchMode('signin'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'signin' ? 'Sign in' : mode === 'register' ? 'Register' : 'Verify your email';

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Drawer */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed right-0 top-0 z-[101] flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-7 py-5">
          <div className="flex items-center gap-3">
            <Logo size={38} href={null} />
            <h2 className="text-[26px] font-normal text-black">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-[17px] text-black hover:text-gray-500 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
            Close
          </button>
        </div>

        {/* Body */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-7 py-7">
          {error && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* ------------------------------ SIGN IN ------------------------------ */}
          {mode === 'signin' && (
            <>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label>Username or email address</Label>
                  <input
                    ref={firstFieldRef}
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <PasswordField
                    value={loginPassword}
                    onChange={setLoginPassword}
                    autoComplete="current-password"
                  />
                </div>

                <Recaptcha onChange={setCaptchaToken} />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-red-600 py-4 text-[15px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Log in'}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2.5 text-[15px] text-gray-800">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 accent-red-600"
                    />
                    Remember me
                  </label>
                  <Link
                    href="/support"
                    onClick={onClose}
                    className="text-[15px] text-black underline-offset-2 hover:underline"
                  >
                    Lost your password?
                  </Link>
                </div>
              </form>

              {/* Register call-to-action */}
              <div className="mt-9 border-t border-gray-200 pt-8 text-center">
                <svg
                  className="mx-auto mb-3 text-gray-400"
                  width="76"
                  height="76"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                </svg>

                <h3 className="mb-3 text-[26px] font-normal text-black">No account yet?</h3>
                <p className="text-[15px] leading-relaxed text-gray-600">
                  Registering for this site allows you to access your order status and history. Just
                  fill in the fields below, and we&apos;ll get a new account set up for you in no
                  time. We will only ask you for information necessary to make the purchase process
                  faster and easier.
                </p>

                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="mt-6 w-full rounded-md border-2 border-black bg-black py-4 text-[15px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
                >
                  Register
                </button>
              </div>
            </>
          )}

          {/* ----------------------------- REGISTER ------------------------------ */}
          {mode === 'register' && (
            <>
              <p className="mb-7 text-[15px] leading-relaxed text-gray-600">
                Registering for this site allows you to access your order status and history. Just
                fill in the fields below, and we&apos;ll get a new account set up for you in no time.
                We will only ask you for information necessary to make the purchase process faster
                and easier.
              </p>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <Label>Full name</Label>
                  <input
                    ref={firstFieldRef}
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    autoComplete="name"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label>Email address</Label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <PasswordField
                    value={regPassword}
                    onChange={setRegPassword}
                    autoComplete="new-password"
                  />
                  <p className="mt-2 px-1 text-xs text-gray-500">
                    Minimum 8 characters, with an uppercase and lowercase letter, a number and a
                    special character (!@#$%^&amp;*).
                  </p>
                </div>

                <div>
                  <Label>Confirm password</Label>
                  <PasswordField
                    value={regConfirm}
                    onChange={setRegConfirm}
                    autoComplete="new-password"
                  />
                </div>

                {!RECAPTCHA_SITE_KEY && showCaptcha && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">{captchaQuestion}</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      placeholder="Your answer"
                      className={inputClass}
                    />
                  </div>
                )}

                <Recaptcha onChange={setCaptchaToken} />

                <p className="text-[13px] leading-relaxed text-gray-500">
                  Your personal data will be used to support your experience throughout this site, to
                  manage access to your account, and for other purposes described in our{' '}
                  <Link href="/privacy" onClick={onClose} className="text-black underline">
                    privacy policy
                  </Link>
                  .
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-red-600 py-4 text-[15px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Register'}
                </button>
              </form>

              <div className="mt-8 border-t border-gray-200 pt-6 text-center">
                <p className="text-[15px] text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="font-semibold text-black underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </>
          )}

          {/* ------------------------------ VERIFY ------------------------------- */}
          {mode === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-5">
              <p className="text-[15px] leading-relaxed text-gray-600">
                We sent a 6-digit verification code to{' '}
                <span className="font-semibold text-black">{regEmail}</span>. Enter it below to
                activate your account.
              </p>

              <div>
                <Label>Verification code</Label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  required
                  className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-red-600 py-4 text-[15px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Verifying…' : 'Verify email'}
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className="w-full py-2 text-[15px] text-black underline"
              >
                ← Back to register
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-7 py-4 text-center">
          <p className="text-[13px] text-gray-500">
            By continuing you agree to our{' '}
            <Link href="/terms" onClick={onClose} className="text-black underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </aside>
    </>,
    document.body
  );
}
