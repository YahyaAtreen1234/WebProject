'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { getAdminDisplayLabel, getStoredAdminInfo } from '@/lib/clientAuth';

export default function Navigation() {
  const { getItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [adminDisplayLabel, setAdminDisplayLabel] = useState('My Account');
  const [isClient, setIsClient] = useState(false);
  const cartCount = getItemCount();

  // First effect: Mark that we're on the client side (hydration complete)
  useEffect(() => {
    setIsClient(true);
    console.log('[Navigation] Client hydration complete');
  }, []);

  // Second effect: Read admin info from localStorage only after hydration
  useEffect(() => {
    if (!isClient) return;

    const updateAdminLabel = () => {
      try {
        const label = getAdminDisplayLabel();
        console.log('[Navigation] Reading admin display label:', label);
        if (label && label !== 'My Account') {
          setAdminDisplayLabel(label);
          console.log('[Navigation] Updated admin display label to:', label);
        }
      } catch (error) {
        console.error('[Navigation] Error reading admin display label:', error);
      }
    };

    // Read immediately on mount
    updateAdminLabel();

    // Listen for storage changes (for same-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminInfo' || e.key === null) {
        console.log('[Navigation] Storage changed, updating label');
        updateAdminLabel();
      }
    };

    // Listen for custom admin auth changed event (faster than polling)
    const handleAdminAuthChanged = (e: Event) => {
      console.log('[Navigation] adminAuthChanged event fired, updating label');
      updateAdminLabel();
    };

    // Fallback: poll localStorage every 500ms to catch same-tab changes
    const pollInterval = setInterval(updateAdminLabel, 500);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminAuthChanged', handleAdminAuthChanged);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminAuthChanged', handleAdminAuthChanged);
      clearInterval(pollInterval);
    };
  }, [isClient]);

  const navItems = [
    { label: 'Shop', href: '/shop' },
    { label: 'Collection', href: '/gallery' },
    { label: 'Track Order', href: '/tracking' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleMyAccount = () => {
    // Check if user or admin is logged in
    try {
      const userToken = localStorage.getItem('userToken');
      const adminToken = localStorage.getItem('adminToken');

      if (adminToken) {
        window.location.href = '/admin/dashboard';
      } else if (userToken) {
        window.location.href = '/user/dashboard';
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('[Navigation] Error checking auth tokens:', error);
      window.location.href = '/login';
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-midnight-900/80 via-midnight-800/80 to-sapphire-900/80 border-b border-sapphire-500/20 shadow-lg shadow-sapphire-500/20">
      <div className="container-gutter">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sapphire-400 via-amethyst-400 to-emerald-400 shadow-lg shadow-sapphire-500/50 group-hover:shadow-amethyst-500/50 transform group-hover:scale-110 flex items-center justify-center">
              <span className="text-white font-bold text-lg">💎</span>
            </div>
            <div className="flex flex-col">
              <span className="text-h4 font-display bg-gradient-to-r from-sapphire-300 to-amethyst-300 bg-clip-text text-transparent font-bold">
                StonesLand
              </span>
              <span className="text-xs text-gold-300 font-semibold">Premium Gems & Minerals</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link font-sans text-sm tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Cart & Auth Icons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/cart" className="relative p-2 rounded-lg hover:bg-sapphire-500/20 transition-all">
              🛒
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={handleMyAccount} className="btn-primary text-sm">
              {adminDisplayLabel}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-0.5 bg-sapphire-400 transition-all ${
                isOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-sapphire-400 transition-all ${
                isOpen ? 'opacity-0' : ''
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-sapphire-400 transition-all ${
                isOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-sapphire-500/20 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block nav-link font-sans text-sm tracking-wide py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button onClick={handleMyAccount} className="w-full btn-primary text-sm">
              {adminDisplayLabel}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
