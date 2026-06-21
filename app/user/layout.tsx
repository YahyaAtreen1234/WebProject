'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const userMenuItems = [
  { label: 'Dashboard', href: '/user/dashboard', icon: '📊' },
  { label: 'My Orders', href: '/user/orders', icon: '📦' },
  { label: 'Shipments', href: '/user/shipments', icon: '🚚' },
  { label: 'Addresses', href: '/user/addresses', icon: '📍' },
  { label: 'Payments', href: '/user/payments', icon: '💳' },
  { label: 'Settings', href: '/user/settings', icon: '⚙️' },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-midnight-900/95 to-sapphire-900/95 border-b border-sapphire-500/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sapphire-400 via-amethyst-400 to-emerald-400 shadow-lg flex items-center justify-center">
                <span className="text-white font-bold">💎</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-h4 font-display text-gradient font-bold">StonesLand</p>
                <p className="text-xs text-gold-300">My Account</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-1">
              {userMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    isActive(item.href)
                      ? 'bg-sapphire-600 text-white'
                      : 'text-midnight-300 hover:text-white hover:bg-sapphire-500/20'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-300 hover:bg-rose-500/30 hover:border-rose-500/50 transition-all font-semibold text-sm"
              >
                🚪 Logout
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-sapphire-500/20 transition-all"
              >
                <span className="text-xl">☰</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-2 border-t border-sapphire-500/20 pt-4">
              {userMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    isActive(item.href)
                      ? 'bg-sapphire-600 text-white'
                      : 'text-midnight-300 hover:text-white hover:bg-sapphire-500/20'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-sapphire-500/20 bg-midnight-900/50 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-midnight-400">
              © 2026 StonesLand. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-midnight-400">
              <button onClick={handleLogout} className="hover:text-sapphire-300 transition-colors">
                Logout
              </button>
              <span>•</span>
              <Link href="/" className="hover:text-sapphire-300 transition-colors">
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
