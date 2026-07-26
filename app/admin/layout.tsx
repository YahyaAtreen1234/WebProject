'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Logo from '@/components/Logo';

const adminMenuItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Messages', href: '/admin/messages', icon: '📧' },
  { label: 'Orders', href: '/admin/orders', icon: '📦' },
  { label: 'Deliveries', href: '/admin/deliveries', icon: '🚚' },
  { label: 'Tracking', href: '/admin/tracking', icon: '📍' },
  { label: 'Delivery Panel', href: '/admin/delivery-panel', icon: '🎛️' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('');
  const [showMenu, setShowMenu] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get admin info from localStorage if available
    const token = localStorage.getItem('adminToken');
    const adminInfo = localStorage.getItem('adminInfo');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (adminInfo) {
      try {
        const { name, email } = JSON.parse(adminInfo);
        setAdminName(name || 'Admin');
        setAdminEmail(email || '');
      } catch (e) {
        console.error('Error parsing admin info:', e);
      }
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', { method: 'POST' });

      // Clear localStorage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');

      // Redirect to login
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear and redirect even if API fails
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      router.push('/admin/login');
    }
  };

  const isActive = (href: string) => pathname === href;

  // Don't apply layout to login page
  if (pathname === '/admin/login') {
    return children;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-midnight-950">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-midnight-900/95 to-sapphire-900/95 border-b border-sapphire-500/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Logo
                href="/admin/orders"
                size={40}
                label="StonesLand"
                tagline="Admin Panel"
                labelClassName="text-h4 font-display text-gradient font-bold"
                taglineClassName="text-xs text-gold-300"
              />

              {/* Desktop Menu */}
              <nav className="hidden md:flex items-center gap-1">
                {adminMenuItems.map((item) => (
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
                {/* Admin Info */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-white">{adminName}</p>
                  <p className="text-xs text-midnight-400">{adminEmail}</p>
                </div>

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
                {adminMenuItems.map((item) => (
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
                © 2026 StonesLand Admin Panel. All rights reserved.
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
    </ProtectedRoute>
  );
}
