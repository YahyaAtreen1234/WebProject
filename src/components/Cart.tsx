'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

export default function CartUI() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, total, removeFromCart, updateQuantity } = useCart();

  return (
      <>
        {/* Cart Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-sapphire-600 to-amethyst-600 text-white shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all flex items-center justify-center text-2xl"
        >
          🛒
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </button>

        {/* Cart Panel */}
        {isOpen && (
          <div className="fixed bottom-24 right-6 w-80 bg-midnight-800 border border-sapphire-500/30 rounded-2xl shadow-2xl backdrop-blur-xl z-40 max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-midnight-800 border-b border-sapphire-500/30 p-4">
              <h3 className="text-lg font-bold text-white">Shopping Cart ({items.length})</h3>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center text-midnight-300">
                <p className="text-2xl mb-2">🛍️</p>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 p-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 items-center bg-midnight-700/50 p-3 rounded-lg border border-sapphire-500/20"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gold-300">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-xs bg-midnight-600/50 hover:bg-sapphire-600/50 rounded text-white"
                        >
                          −
                        </button>
                        <span className="text-xs text-white w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-xs bg-midnight-600/50 hover:bg-sapphire-600/50 rounded text-white"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-midnight-800 border-t border-sapphire-500/30 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-lg font-bold text-gold-300">${total.toFixed(2)}</span>
                  </div>
                  <button className="w-full btn-primary">Checkout</button>
                </div>
              </>
            )}
          </div>
        )}
      </>
    );
}
