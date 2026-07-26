'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/components/Logo';

export default function Footer() {
  const [newsletter, setNewsletter] = useState('');
  const [success, setSuccess] = useState('');

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
        setSuccess('✓ Subscribed successfully!');
        setNewsletter('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Newsletter error:', error);
    }
  };

  return (
    <footer className="bg-black text-white">
      {/* Trust Badges Section */}
      <div className="bg-black border-b border-gray-800 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl mb-2">👤</div>
            <h3 className="font-bold mb-1">24/7 Support</h3>
            <p className="text-gray-400 text-sm">Always here to help</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-bold mb-1">Money Back Guarantee</h3>
            <p className="text-gray-400 text-sm">100% satisfied or refunded</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-bold mb-1">Secure Payment</h3>
            <p className="text-gray-400 text-sm">SSL encrypted transactions</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="font-bold mb-1">Worldwide Free Shipping</h3>
            <p className="text-gray-400 text-sm">Fast delivery worldwide</p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Column 1: INFORMATION */}
          <div>
            <h4 className="text-sm font-bold uppercase mb-6 border-b border-gray-700 pb-4">Information</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link href="/exhibitions" className="text-gray-300 hover:text-white">Exhibitions</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-white">FAQs</Link></li>
              <li><Link href="/reviews" className="text-gray-300 hover:text-white">Reviews</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
              <li><Link href="/custom-order" className="text-gray-300 hover:text-white">Custom Order</Link></li>
              <li><Link href="/affiliate" className="text-gray-300 hover:text-white">Affiliate Program</Link></li>
              <li><Link href="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
            </ul>
          </div>

          {/* Column 2: SUPPORT */}
          <div>
            <h4 className="text-sm font-bold uppercase mb-6 border-b border-gray-700 pb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/how-to-order" className="text-gray-300 hover:text-white">How to Order</Link></li>
              <li><Link href="/payment-info" className="text-gray-300 hover:text-white">Payment Information</Link></li>
              <li><Link href="/we-buy" className="text-gray-300 hover:text-white">We Buy</Link></li>
              <li><Link href="/returns" className="text-gray-300 hover:text-white">Refund & Returns</Link></li>
              <li><Link href="/shipping" className="text-gray-300 hover:text-white">Shipping Policy</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Services</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: SHOPPING */}
          <div>
            <h4 className="text-sm font-bold uppercase mb-6 border-b border-gray-700 pb-4">Shopping</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/account" className="text-gray-300 hover:text-white">My Account</Link></li>
              <li><Link href="/orders" className="text-gray-300 hover:text-white">Order Status</Link></li>
              <li><Link href="/wishlist" className="text-gray-300 hover:text-white">Wishlist</Link></li>
              <li><Link href="/cart" className="text-gray-300 hover:text-white">Shopping Cart</Link></li>
              <li><Link href="/checkout" className="text-gray-300 hover:text-white">Checkout</Link></li>
              <li><Link href="/guarantee" className="text-gray-300 hover:text-white">Guarantee</Link></li>
              <li><Link href="/shop" className="text-gray-300 hover:text-white">Shop All</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: SUBSCRIBE */}
          <div>
            <h4 className="text-sm font-bold uppercase mb-6 border-b border-gray-700 pb-4">Subscribe</h4>
            <p className="text-sm text-gray-300 mb-4">Subscribe to our newsletter, and get exclusive offers & updates.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2 mb-6">
              <input
                type="email"
                placeholder="Enter Your Email Address"
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                className="px-3 py-2 bg-white text-black text-sm rounded focus:outline-none"
                required
              />
              <button type="submit" className="bg-red-600 text-white font-bold px-4 py-2 rounded hover:bg-red-700">
                JOIN
              </button>
            </form>
            {success && <p className="text-green-400 text-xs">{success}</p>}
            <p className="text-xs text-gray-400 mb-4">Follow us on our social platforms</p>
            <div className="flex gap-3 flex-wrap">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:scale-110">📘</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:scale-110">📷</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:scale-110">💼</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:scale-110">📹</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:scale-110">🎵</a>
              <a href="https://ebay.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:scale-110">🛍️</a>
              <a href="https://etsy.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:scale-110">🎨</a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:scale-110">💬</a>
            </div>
          </div>

          {/* Column 5: ADDRESS */}
          <div>
            <h4 className="text-sm font-bold uppercase mb-6 border-b border-gray-700 pb-4">Address</h4>
            <div className="text-sm text-gray-300 space-y-2 mb-6">
              <p>Office No. 1, Al Mukhtiar Gems</p>
              <p>Chamber, Gem Street, Namak</p>
              <p>Mandi, Peshawar, Khyber</p>
              <p>Pakhtunkhwa, 25000, Pakistan.</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">
                <span className="text-lg mr-2">📧</span>
                <a href="mailto:info@stonesland.com" className="text-gray-300 hover:text-white">info@stonesland.com</a>
              </p>
              <p className="text-gray-400">
                <span className="text-lg mr-2">📱</span>
                <a href="tel:+923469191091" className="text-gray-300 hover:text-white">+92 346 919 1091</a>
              </p>
            </div>
          </div>
        </div>

        {/* Payment & Security Section */}
        <div className="border-t border-gray-800 pt-12 pb-8">
          <div className="text-center mb-8">
            <h4 className="text-sm font-bold uppercase mb-4 text-gray-400">Payment Methods & Security</h4>
            <div className="flex justify-center gap-4 flex-wrap mb-4">
              <span className="text-lg">💳 VISA</span>
              <span className="text-lg">💳 Mastercard</span>
              <span className="text-lg">🅿️ PayPal</span>
              <span className="text-lg">💳 Amex</span>
              <span className="text-lg">💳 Stripe</span>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              <span className="text-xs bg-gray-800 px-3 py-1 rounded">🔒 SSL SECURE</span>
              <span className="text-xs bg-gray-800 px-3 py-1 rounded">🔐 Secure Encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-gray-800 py-8 px-4 sm:px-6 text-center text-sm text-gray-500">
        <Logo variant="full" size={200} className="mb-6 inline-block" />
        <p>© 2026 StonesLand. Established 1968. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
