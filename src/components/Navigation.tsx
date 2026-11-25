'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { cartUtils } from '@/lib/cart';
import {
  COMPARE_CHANGED_EVENT,
  USER_AUTH_CHANGED_EVENT,
  WISHLIST_CHANGED_EVENT,
  clearStoredUserAuth,
  getStoredUserInfo,
  getStoredUserToken,
  type StoredUserInfo,
} from '@/lib/clientAuth';
import AuthPanel from '@/components/AuthPanel';
import Logo from '@/components/Logo';

export default function Navigation() {
  const { cart, getItemCount } = useCart();
  const [authPanelOpen, setAuthPanelOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [compareCount, setCompareCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<StoredUserInfo | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [language, setLanguage] = useState('ENGLISH');
  const [currency, setCurrency] = useState('USD');
  const [newsletter, setNewsletter] = useState('');
  const [newsLetterSuccess, setNewsLetterSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(true);
  const tickingRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const scrollDirectionRef = useRef<'up' | 'down' | null>(null);
  const scrollDistanceRef = useRef(0);

  useEffect(() => {
    setIsClient(true);
    setCartCount(getItemCount());
    setCartSubtotal(cartUtils.getCartTotals(cart).subtotal);
  }, [cart, getItemCount]);

  // Compare and wishlist live server-side, so their badges are refreshed on
  // mount and whenever an item is added or removed anywhere in the app.
  useEffect(() => {
    const loadCount = async (
      endpoint: string,
      apply: (count: number) => void
    ) => {
      const token = getStoredUserToken();
      if (!token) {
        apply(0);
        return;
      }

      try {
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        apply(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error(`[Navigation] Failed to load count from ${endpoint}:`, error);
      }
    };

    const refreshCompare = () => loadCount('/api/compare', setCompareCount);
    const refreshWishlist = () => loadCount('/api/wishlist', setWishlistCount);

    // Signing in or out changes whose lists these are, so refresh both.
    const refreshAuth = () => {
      setUser(getStoredUserInfo());
      refreshCompare();
      refreshWishlist();
    };

    refreshAuth();

    window.addEventListener(COMPARE_CHANGED_EVENT, refreshCompare);
    window.addEventListener(WISHLIST_CHANGED_EVENT, refreshWishlist);
    window.addEventListener(USER_AUTH_CHANGED_EVENT, refreshAuth);
    // Keep other tabs in sync.
    window.addEventListener('storage', refreshAuth);
    return () => {
      window.removeEventListener(COMPARE_CHANGED_EVENT, refreshCompare);
      window.removeEventListener(WISHLIST_CHANGED_EVENT, refreshWishlist);
      window.removeEventListener(USER_AUTH_CHANGED_EVENT, refreshAuth);
      window.removeEventListener('storage', refreshAuth);
    };
  }, []);

  // Close the account dropdown when clicking anywhere else.
  useEffect(() => {
    if (!accountMenuOpen) return;

    const onDocumentClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement)?.closest('[data-account-menu]')) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [accountMenuOpen]);

  const handleLogout = () => {
    clearStoredUserAuth();
    setAccountMenuOpen(false);
    window.location.href = '/';
  };

  // Keep the guarantee strip at the top and hide the full navigation while
  // scrolling down. A short direction threshold prevents trackpad jitter from
  // repeatedly toggling the header.
  useEffect(() => {
    const COLLAPSE_AT = 80;
    const RESTORE_AT = 20;
    const DIRECTION_THRESHOLD = 12;

    const evaluate = () => {
      const y = Math.max(window.scrollY, 0);
      setAtTop((wasAtTop) => (wasAtTop ? y <= COLLAPSE_AT : y <= RESTORE_AT));

      const delta = y - lastScrollYRef.current;
      if (y <= RESTORE_AT) {
        setHeaderVisible(true);
        scrollDirectionRef.current = null;
        scrollDistanceRef.current = 0;
      } else if (delta !== 0) {
        const direction = delta > 0 ? 'down' : 'up';
        if (direction !== scrollDirectionRef.current) {
          scrollDirectionRef.current = direction;
          scrollDistanceRef.current = 0;
        }
        scrollDistanceRef.current += Math.abs(delta);
        if (scrollDistanceRef.current >= DIRECTION_THRESHOLD) {
          setHeaderVisible(direction === 'up');
        }
      }

      lastScrollYRef.current = y;
      tickingRef.current = false;
    };

    const handleScroll = () => {
      // Coalesce bursts of scroll events into one update per frame.
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(evaluate);
    };

    evaluate();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletter) return;
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletter }),
      });
      if (response.ok) {
        setNewsLetterSuccess('✓ Subscribed successfully!');
        setNewsletter('');
        setTimeout(() => setNewsLetterSuccess(''), 3000);
        console.log('[Navigation] Newsletter subscribed:', newsletter);
      }
    } catch (error) {
      console.error('[Navigation] Newsletter error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-transform duration-300 ease-out motion-reduce:transition-none ${
        mobileMenuOpen ? 'transform-none' : headerVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Money Back Guarantee Banner — collapses away once the page is scrolled,
          and comes back only on a return to the top. `grid-template-rows` is
          animated rather than max-height so the strip's own height stays the
          bound, with no arbitrary ceiling to guess at and no easing dead time
          if the text ever wraps to two lines. */}
      <div
        aria-hidden={!atTop}
        className={`grid overflow-hidden bg-emerald-900 text-gold-100 transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          atTop ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <p className="px-4 py-2 text-center text-sm font-semibold sm:px-6">
            Shop with confidence with our 15 day money back guarantee
          </p>
        </div>
      </div>

      {/* Top Navigation */}
      <div className="bg-black text-white text-sm py-3 px-4 sm:px-6 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-black text-white cursor-pointer hover:text-gray-300"
            >
              <option>ENGLISH</option>
              <option>ESPAÑOL</option>
              <option>FRANÇAIS</option>
              <option>DEUTSCH</option>
              <option>中文</option>
            </select>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-black text-white cursor-pointer hover:text-gray-300"
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>CAD</option>
              <option>AUD</option>
            </select>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-gray-300">ABOUT US</Link>
            <Link href="/blog" className="hover:text-gray-300">BLOG</Link>
            <Link href="/custom-order" className="hover:text-gray-300">MAKE A CUSTOM ORDER</Link>
            <Link href="/we-buy" className="hover:text-gray-300">WE BUY</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-gray-50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative flex items-center justify-between gap-2 sm:gap-4">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              className="mr-auto flex items-center gap-2 text-base font-semibold text-black sm:hidden"
            >
              <span aria-hidden="true" className="text-2xl leading-none">☰</span>
              <span>MENU</span>
            </button>

            {/* Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 scale-[0.833333] sm:static sm:translate-x-0 sm:scale-100">
              <Logo label="STONES LAND" tagline="Premium Gems & Minerals" size={48} />
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
              <div className="flex w-full">
                <input
                  type="text"
                  placeholder="Search for products"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-sm text-black placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2.5 hover:bg-gray-800 text-xl"
                >
                  🔍
                </button>
              </div>
            </form>

            {/* Account Icons */}
            <div className="hidden items-center gap-2 sm:flex sm:gap-4">
              {user ? (
                <div className="relative hidden sm:block" data-account-menu>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((open) => !open)}
                    className="flex items-center gap-1.5 max-w-[180px] text-xs sm:text-sm font-semibold text-black hover:text-gray-600"
                    title={user.email}
                  >
                    <span className="text-base">👤</span>
                    <span className="truncate">{user.email || user.name}</span>
                    <span className="text-[10px]">▼</span>
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 border border-gray-200 bg-white shadow-lg">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="text-sm font-semibold text-black truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/user/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        My Wishlist
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full border-t border-gray-100 px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-gray-100"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthPanelOpen(true)}
                  className="hidden text-xs font-semibold text-black hover:text-gray-600 sm:block sm:text-sm"
                >
                  LOGIN / REGISTER
                </button>
              )}
              <Link
                href="/wishlist"
                className="relative text-xl hover:text-gray-600"
                title="Wishlist"
              >
                ♡
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              </Link>
              <Link
                href="/compare"
                className="relative text-xl hover:text-gray-600"
                title="Compare"
              >
                ⟷
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {compareCount}
                </span>
              </Link>
              <Link href="/cart" className="relative text-xl hover:text-gray-600" title="Cart">
                🛒
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
              </Link>
              <Link href="/cart" className="hidden text-sm font-bold text-gold-600 hover:text-gray-600 sm:block">
                ${cartSubtotal.toFixed(2)}
              </Link>
            </div>

            <Link
              href="/cart"
              className="relative ml-auto flex h-10 w-10 items-center justify-center text-xl text-black hover:text-gray-600 sm:hidden"
              title="Cart"
              aria-label={`Cart, ${cartCount} items`}
            >
              🛒
              <span className="absolute right-0 top-0 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white">
                {cartCount}
              </span>
            </Link>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex sm:hidden mt-3">
            <input
              type="text"
              placeholder="Search for products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-gray-300 text-sm text-black placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="bg-black text-white px-3 py-2 hover:bg-gray-800">
              🔍
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 pt-3 sm:hidden">
            <Link
              href="/wishlist"
              className="flex min-w-0 items-center justify-center gap-1.5 rounded border border-gray-200 px-2 py-2 text-sm text-black hover:bg-gray-100"
            >
              <span aria-hidden="true" className="text-lg font-bold text-rose-700">♥</span>
              <span>Wishlist</span>
              <span className="rounded-full bg-red-600 px-1.5 text-xs text-white">{wishlistCount}</span>
            </Link>
            <Link
              href="/compare"
              className="flex min-w-0 items-center justify-center gap-1.5 rounded border border-gray-200 px-2 py-2 text-sm text-black hover:bg-gray-100"
            >
              <span aria-hidden="true" className="text-lg font-bold text-blue-700">⟷</span>
              <span>Compare</span>
              <span className="rounded-full bg-red-600 px-1.5 text-xs text-white">{compareCount}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="bg-black text-white border-t border-gray-800 px-4 sm:px-6 py-2 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-sm font-semibold">
          <div className="relative group">
            <button className="flex items-center gap-1 py-3 text-white hover:text-gray-300">
              ☰ BROWSE CATEGORIES
            </button>
            <div className="absolute left-0 mt-0 w-48 bg-black border border-gray-800 shadow-lg hidden group-hover:block z-50">
              <Link href="/gallery?search=Amethyst" className="block px-4 py-2 text-white hover:bg-gray-800">Amethyst</Link>
              <Link href="/gallery?search=Rose+Quartz" className="block px-4 py-2 text-white hover:bg-gray-800">Rose Quartz</Link>
              <Link href="/gallery?search=Citrine" className="block px-4 py-2 text-white hover:bg-gray-800">Citrine</Link>
              <Link href="/gallery?search=Clear+Quartz" className="block px-4 py-2 text-white hover:bg-gray-800">Clear Quartz</Link>
              <Link href="/gallery?search=Tourmaline" className="block px-4 py-2 text-white hover:bg-gray-800">Tourmaline</Link>
              <Link href="/gallery?search=Garnet" className="block px-4 py-2 text-white hover:bg-gray-800">Garnet</Link>
              <Link href="/gallery?search=Jade" className="block px-4 py-2 text-white hover:bg-gray-800">Jade</Link>
              <Link href="/gallery" className="block px-4 py-2 text-white hover:bg-gray-800 font-bold border-t border-gray-700">View All</Link>
            </div>
          </div>

          <Link href="/" className="py-3 text-white hover:text-gray-300">HOME</Link>

          <div className="relative group">
            <button className="flex items-center gap-1 py-3 text-white hover:text-gray-300">
              SHOP ▼
            </button>
            <div className="absolute left-0 mt-0 w-48 bg-black border border-gray-800 shadow-lg hidden group-hover:block z-50">
              <Link href="/shop" className="block px-4 py-2 text-white hover:bg-gray-800">All Products</Link>
              <Link href="/shop?sort=newest" className="block px-4 py-2 text-white hover:bg-gray-800">New Arrivals</Link>
              <Link href="/shop?sort=price-low" className="block px-4 py-2 text-white hover:bg-gray-800">On Sale</Link>
              <Link href="/shop?sort=featured" className="block px-4 py-2 text-white hover:bg-gray-800">Best Sellers</Link>
            </div>
          </div>

          <Link href="/gallery" className="py-3 text-white hover:text-gray-300">GEMSTONES</Link>
          <Link href="/auctions" className="py-3 text-white hover:text-gray-300">AUCTIONS</Link>

          <div className="relative group">
            <button className="flex items-center gap-1 py-3 text-white hover:text-gray-300">
              HELP & SUPPORT ▼
            </button>
            <div className="absolute left-0 mt-0 w-48 bg-black border border-gray-800 shadow-lg hidden group-hover:block z-50">
              <Link href="/faq" className="block px-4 py-2 text-white hover:bg-gray-800">FAQ</Link>
              <Link href="/shipping" className="block px-4 py-2 text-white hover:bg-gray-800">Shipping Info</Link>
              <Link href="/returns" className="block px-4 py-2 text-white hover:bg-gray-800">Returns Policy</Link>
              <Link href="/contact" className="block px-4 py-2 text-white hover:bg-gray-800">Contact Us</Link>
              <Link href="/tracking" className="block px-4 py-2 text-white hover:bg-gray-800">Track Order</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="absolute inset-x-0 top-full z-[60] flex max-h-[70vh] flex-col overflow-y-auto border-t border-gray-700 bg-black px-6 py-5 text-white shadow-xl sm:hidden"
        >
          <div className="mb-5 flex items-center justify-between border-b border-gray-700 pb-4">
            <div role="heading" aria-level={2} className="text-xl font-bold tracking-wider text-white">MENU</div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="rounded px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              CLOSE <span aria-hidden="true" className="ml-1 text-lg">×</span>
            </button>
          </div>
          {user ? (
            <div className="border-b border-gray-700 pb-3">
              <p className="truncate py-2 text-sm font-semibold text-white">👤 {user.email}</p>
              <Link
                href="/user/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-semibold text-white hover:bg-gray-800 hover:text-white"
              >
                MY ACCOUNT
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full py-3 text-left font-semibold text-red-400 hover:bg-gray-800 hover:text-red-300"
              >
                LOG OUT
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthPanelOpen(true);
              }}
              className="block w-full border-b border-gray-700 py-3 text-left font-semibold text-white hover:bg-gray-800 hover:text-white"
            >
              LOGIN / REGISTER
            </button>
          )}
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block border-b border-gray-800 py-3 font-semibold text-white hover:bg-gray-800 hover:text-white">HOME</Link>
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block border-b border-gray-800 py-3 font-semibold text-white hover:bg-gray-800 hover:text-white">SHOP</Link>
          <Link href="/gallery" onClick={() => setMobileMenuOpen(false)} className="block border-b border-gray-800 py-3 font-semibold text-white hover:bg-gray-800 hover:text-white">GEMSTONES</Link>
          <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block border-b border-gray-800 py-3 font-semibold text-white hover:bg-gray-800 hover:text-white">WISHLIST</Link>
          <Link href="/compare" onClick={() => setMobileMenuOpen(false)} className="block border-b border-gray-800 py-3 font-semibold text-white hover:bg-gray-800 hover:text-white">COMPARE</Link>
          <Link href="/tracking" onClick={() => setMobileMenuOpen(false)} className="block border-b border-gray-800 py-3 font-semibold text-white hover:bg-gray-800 hover:text-white">TRACK ORDER</Link>
          <Link href="/auctions" onClick={() => setMobileMenuOpen(false)} className="block border-b border-gray-800 py-3 font-semibold text-white hover:bg-gray-800 hover:text-white">AUCTIONS</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block border-b border-gray-800 py-3 font-semibold text-white hover:bg-gray-800 hover:text-white">ABOUT US</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block border-b border-gray-800 py-3 font-semibold text-white hover:bg-gray-800 hover:text-white">CONTACT</Link>
          <div className="flex gap-3 py-4 text-xs">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded border border-gray-600 bg-gray-900 px-2 py-2 text-white">
              <option>ENGLISH</option>
              <option>ESPAÑOL</option>
            </select>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded border border-gray-600 bg-gray-900 px-2 py-2 text-white">
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
        </div>
      )}

      {/* Sign in / Register slide-out panel */}
      <AuthPanel open={authPanelOpen} onClose={() => setAuthPanelOpen(false)} />
    </header>
  );
}
