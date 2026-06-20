'use client';

import Link from 'next/link';
import { useCart } from '@/src/context/CartContext';
import { cartUtils } from '@/src/lib/cart';

export default function ShoppingCart() {
  const { cart, removeItem, updateQuantity } = useCart();
  const totals = cartUtils.getCartTotals(cart);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-8">Shopping Cart</h1>

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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="card-glass p-6 border border-sapphire-500/20 flex items-center gap-6"
              >
                <div className="text-5xl">{item.image}</div>

                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{item.name}</h3>
                  <p className="text-midnight-400 text-sm mt-1">
                    {item.color} • {item.weight} • {item.origin}
                  </p>
                  <p className="text-sapphire-400 font-semibold mt-2">${item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="px-3 py-1 bg-midnight-800 rounded hover:bg-midnight-700 transition-colors text-white"
                  >
                    −
                  </button>
                  <span className="text-white font-semibold min-w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 bg-midnight-800 rounded hover:bg-midnight-700 transition-colors text-white"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-rose-400 hover:text-rose-300 text-sm font-semibold mt-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="card-glass p-6 border border-sapphire-500/20 h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-midnight-700">
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
            </div>

            <div className="flex justify-between mb-6">
              <span className="text-white font-bold text-lg">Total</span>
              <span className="text-sapphire-400 font-bold text-lg">${totals.total.toFixed(2)}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full px-6 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg hover:from-sapphire-700 hover:to-sapphire-800 transition-all font-semibold mb-3 text-center"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/gallery"
              className="block text-center px-6 py-3 bg-midnight-800 text-midnight-300 rounded-lg hover:text-white transition-colors font-semibold"
            >
              Continue Shopping
            </Link>

            {totals.shipping === 0 && (
              <p className="text-emerald-400 text-sm mt-4 text-center">
                ✓ Free shipping on orders over $100!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
