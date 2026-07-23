'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';

export default function Navigation() {
  const { getItemCount } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [language, setLanguage] = useState('ENGLISH');
  const [currency, setCurrency] = useState('USD');
  const [newsletter, setNewsletter] = useState('');
  const [newsLetterSuccess, setNewsLetterSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCartCount(getItemCount());
  }, [getItemCount]);

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
    <header className="sticky top-0 z-50 bg-white">
      {/* Money Back Guarantee Banner */}
      <div className="bg-red-900 text-white py-2 px-4 sm:px-6 text-center text-sm font-semibold">
        Shop with confidence with our 15 day money back guarantee
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
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-black">💎 StonesLand</span>
                <span className="text-xs sm:text-sm text-gray-600">Premium Gems & Minerals</span>
              </div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
              <div className="flex w-full">
                <input
                  type="text"
                  placeholder="Search for products"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
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
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/admin/login" className="text-xs sm:text-sm font-semibold text-black hover:text-gray-600">
                LOGIN / REGISTER
              </Link>
              <Link href="/wishlist" className="relative text-xl hover:text-gray-600" title="Wishlist">
                ♡
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
              </Link>
              <Link href="/compare" className="relative text-xl hover:text-gray-600" title="Compare">
                ⟷
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
              </Link>
              <Link href="/cart" className="relative text-xl hover:text-gray-600" title="Cart">
                🛒
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
              </Link>
              <Link href="/cart" className="text-sm font-bold text-gold-600 hover:text-gray-600">
                ${(cartCount * 50).toFixed(2)}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden text-2xl"
            >
              ☰
            </button>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex sm:hidden mt-3">
            <input
              type="text"
              placeholder="Search for products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="bg-black text-white px-3 py-2 hover:bg-gray-800">
              🔍
            </button>
          </form>
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
        <div className="sm:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-3">
          <Link href="/shop" className="block py-2 hover:text-gray-600">SHOP</Link>
          <Link href="/gallery" className="block py-2 hover:text-gray-600">GEMSTONES</Link>
          <Link href="/tracking" className="block py-2 hover:text-gray-600">TRACK ORDER</Link>
          <Link href="/auctions" className="block py-2 hover:text-gray-600">AUCTIONS</Link>
          <Link href="/about" className="block py-2 hover:text-gray-600">ABOUT US</Link>
          <Link href="/contact" className="block py-2 hover:text-gray-600">CONTACT</Link>
          <div className="flex gap-3 text-xs py-2">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border rounded px-2 py-1">
              <option>ENGLISH</option>
              <option>ESPAÑOL</option>
            </select>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border rounded px-2 py-1">
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
}
