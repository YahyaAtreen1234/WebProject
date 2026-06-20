'use client';

import Link from 'next/link';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySwitcher from './CurrencySwitcher';

export default function MainNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-midnight-900 border-b border-sapphire-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-sapphire-400 to-amethyst-400 bg-clip-text text-transparent">
              ✨ Minerals
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/gallery"
              className="px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all"
            >
              Gallery
            </Link>

            <Link
              href="/blog"
              className="px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all"
            >
              📚 Blog
            </Link>

            <Link
              href="/about"
              className="px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all"
            >
              About Us
            </Link>

            {/* Language & Currency Switchers */}
            <div className="ml-4 pl-4 border-l border-sapphire-500/20 flex items-center gap-2">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>

            {/* Phase 1 Features */}
            <div className="flex items-center gap-1 ml-4 pl-4 border-l border-sapphire-500/20">
              <Link
                href="/wishlist"
                className="px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all flex items-center gap-1"
              >
                ❤️ Wishlist
              </Link>

              <Link
                href="/comparison"
                className="px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all flex items-center gap-1"
              >
                ⚖️ Compare
              </Link>

              <Link
                href="/custom-orders"
                className="px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all flex items-center gap-1"
              >
                ✨ Custom Orders
              </Link>

              <Link
                href="/guarantee"
                className="px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all flex items-center gap-1"
              >
                ✓ Guarantee
              </Link>

              <Link
                href="/support"
                className="px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all flex items-center gap-1"
              >
                💬 Support
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden px-2 py-2 text-white hover:bg-sapphire-500/10 rounded-lg"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-sapphire-500/20 pt-4">
            <Link
              href="/gallery"
              className="block px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all"
            >
              Gallery
            </Link>

            <Link
              href="/blog"
              className="block px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all"
            >
              📚 Blog
            </Link>

            <Link
              href="/about"
              className="block px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all"
            >
              About Us
            </Link>

            <div className="px-2 py-2 text-sm text-sapphire-400 font-semibold">Phase 1 Features:</div>

            <Link
              href="/wishlist"
              className="block px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all"
            >
              ❤️ Wishlist
            </Link>

            <Link
              href="/comparison"
              className="block px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all"
            >
              ⚖️ Compare Products
            </Link>

            <Link
              href="/custom-orders"
              className="block px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all"
            >
              ✨ Custom Orders
            </Link>

            <Link
              href="/guarantee"
              className="block px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all"
            >
              ✓ Money-Back Guarantee
            </Link>

            <Link
              href="/support"
              className="block px-4 py-2 text-midnight-300 hover:text-white hover:bg-sapphire-500/10 rounded-lg transition-all"
            >
              💬 Help & Support
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}