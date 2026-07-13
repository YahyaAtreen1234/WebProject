'use client';

import { useState } from 'react';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  image?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  const isRuby = product.id === '5';

  return (
    <>
      <div className="group cursor-pointer">
        <div className="card-gradient overflow-hidden rounded-2xl h-full">
          {/* Image Container */}
          <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-sapphire-900/50 to-amethyst-900/50 mb-0">
            {isRuby ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900 via-red-700 to-red-900">
                <div
                  className="w-3/4 h-3/4 rounded-full shadow-2xl"
                  style={{
                    background: 'radial-gradient(ellipse at 30% 30%, #ff4444, #dd0000 40%, #660000 80%, #220000)',
                    boxShadow: '0 0 50px rgba(255, 68, 68, 0.9), inset -3px -3px 8px rgba(0, 0, 0, 0.6), inset 3px 3px 8px rgba(255, 100, 100, 0.4)',
                  }}
                />
              </div>
            ) : product.image ? (
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-50">
                💎
              </div>
            )}

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 btn-primary text-sm"
              >
                View Details
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="px-4 py-3 rounded-lg font-bold text-2xl hover:scale-110 transition-transform"
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-sapphire-500 to-amethyst-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {product.category}
            </div>

            {/* Stock Status */}
            <div className="absolute top-4 left-4">
              {product.stock > 5 ? (
                <span className="bg-emerald-500/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                  In Stock
                </span>
              ) : product.stock > 0 ? (
                <span className="bg-gold-500/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Low Stock
                </span>
              ) : (
                <span className="bg-rose-500/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sapphire-300 transition-colors line-clamp-2">
              {product.title}
            </h3>

            <p className="text-xs text-midnight-400 mb-4 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-end justify-between mb-4">
              <p className="text-2xl font-bold bg-gradient-to-r from-gold-300 to-rose-300 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </p>
              <div className="text-2xl group-hover:scale-125 transition-transform">⭐</div>
            </div>

            {/* Quick Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-sapphire-600 to-amethyst-600 hover:from-sapphire-500 hover:to-amethyst-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-midnight-800 border border-sapphire-500/30 rounded-3xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-midnight-800 border-b border-sapphire-500/30 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{product.title}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl text-midnight-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-bold text-white mb-2">Description</h3>
                <p className="text-midnight-200">{product.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-midnight-700/50 p-4 rounded-lg border border-sapphire-500/20">
                  <p className="text-xs text-midnight-400 mb-1">Category</p>
                  <p className="font-semibold text-white">{product.category}</p>
                </div>
                <div className="bg-midnight-700/50 p-4 rounded-lg border border-sapphire-500/20">
                  <p className="text-xs text-midnight-400 mb-1">Stock Available</p>
                  <p className="font-semibold text-white">{product.stock} units</p>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="border-t border-sapphire-500/20 pt-6">
                <label className="text-sm text-midnight-300 mb-3 block">Quantity</label>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 rounded-lg bg-midnight-700/50 hover:bg-sapphire-600/50 text-white font-bold"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-white w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 rounded-lg bg-midnight-700/50 hover:bg-sapphire-600/50 text-white font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart();
                    setShowModal(false);
                  }}
                  disabled={product.stock === 0}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  Add {quantity} to Cart - ${(product.price * quantity).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
