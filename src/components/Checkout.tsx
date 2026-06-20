'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/src/context/CartContext';
import { cartUtils } from '@/src/lib/cart';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const totals = cartUtils.getCartTotals(cart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<any>(null);
  const [discountError, setDiscountError] = useState('');
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setValidatingDiscount(true);
    setDiscountError('');

    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode,
          orderAmount: totals.subtotal,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid discount code');
      }

      const data = await response.json();
      setDiscountInfo(data.discount);
      setDiscountCode('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply discount';
      setDiscountError(message);
      setDiscountInfo(null);
    } finally {
      setValidatingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setDiscountInfo(null);
    setDiscountCode('');
    setDiscountError('');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.customerName || !formData.customerEmail || !formData.address) {
        throw new Error('Please fill in all required fields');
      }

      if (cart.items.length === 0) {
        throw new Error('Your cart is empty');
      }

      // Calculate final total with discount
      let finalTotal = totals.total;
      let discountAmount = 0;
      let appliedDiscountCode = '';

      if (discountInfo) {
        discountAmount = discountInfo.discountAmount || 0;
        finalTotal = totals.total - discountAmount;
        appliedDiscountCode = discountInfo.code;
      }

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          items: cart.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal: totals.subtotal,
          tax: totals.tax,
          shipping: totals.shipping,
          discount: discountAmount,
          discountCode: appliedDiscountCode,
          total: finalTotal,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        throw new Error(result.error.message || 'Stripe checkout failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setToast('');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-8">Checkout</h1>
          <div className="card-glass p-12 border border-sapphire-500/20 text-center">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-midnight-400 text-xl mb-8">Your cart is empty</p>
            <Link
              href="/gallery"
              className="inline-block px-8 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg hover:from-sapphire-700 hover:to-sapphire-800 transition-all font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout} className="space-y-6">
              {/* Contact Info */}
              <div className="card-glass p-6 border border-sapphire-500/20">
                <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="customerName"
                    placeholder="Full Name"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
                  />
                  <input
                    type="email"
                    name="customerEmail"
                    placeholder="Email Address"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
                  />
                  <input
                    type="tel"
                    name="customerPhone"
                    placeholder="Phone Number (Optional)"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="card-glass p-6 border border-sapphire-500/20">
                <h2 className="text-xl font-bold text-white mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State/Province"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="Postal Code"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
                    />
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>Australia</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="card-glass p-4 border border-rose-500/30 bg-rose-500/10">
                  <p className="text-rose-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg hover:from-sapphire-700 hover:to-sapphire-800 transition-all font-semibold disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>

              <Link
                href="/cart"
                className="block text-center text-sapphire-400 hover:text-sapphire-300 transition-colors"
              >
                ← Return to Cart
              </Link>
            </form>
          </div>

          {/* Order Summary */}
          <div className="card-glass p-6 border border-sapphire-500/20 h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-midnight-700">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-midnight-300 text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Discount Code Input */}
            {!discountInfo && (
              <div className="mb-6 pb-6 border-b border-midnight-700">
                <label className="block text-sm font-medium text-midnight-300 mb-2">
                  Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value);
                      setDiscountError('');
                    }}
                    placeholder="Enter code..."
                    className="flex-1 px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={validatingDiscount}
                    className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    {validatingDiscount ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {discountError && (
                  <p className="text-rose-400 text-sm mt-2">{discountError}</p>
                )}
              </div>
            )}

            {/* Applied Discount */}
            {discountInfo && (
              <div className="mb-6 pb-6 border-b border-midnight-700 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-emerald-400 font-medium text-sm">{discountInfo.description || 'Discount Applied'}</p>
                    <p className="text-midnight-400 text-xs">Code: {discountInfo.code}</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeDiscount}
                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 mb-6 pb-6 border-b border-midnight-700">
              <div className="flex justify-between text-midnight-300">
                <span>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-midnight-300">
                <span>Tax (8%)</span>
                <span>${totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-midnight-300">
                <span>Shipping</span>
                <span>{totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}</span>
              </div>
              {discountInfo && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({discountInfo.type === 'percentage' ? `${discountInfo.value}%` : 'Fixed'})</span>
                  <span>-${discountInfo.discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between mb-6">
              <span className="text-white font-bold text-lg">Total</span>
              <span className="text-sapphire-400 font-bold text-lg">
                ${discountInfo
                  ? (totals.total - discountInfo.discountAmount).toFixed(2)
                  : totals.total.toFixed(2)
                }
              </span>
            </div>

            {totals.shipping === 0 && (
              <p className="text-emerald-400 text-sm text-center">
                ✓ Free shipping on orders over $100!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
