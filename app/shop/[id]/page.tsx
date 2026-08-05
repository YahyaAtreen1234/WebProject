'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string | null;
  featured?: boolean;
  trackingNumber?: string | null;
  dealDeadline?: string | null;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { addItem, isInCart, getItemQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);

        if (response.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }

        if (!response.ok) throw new Error(`Request failed (${response.status})`);

        const data = await response.json();
        if (!cancelled) setProduct(data);
      } catch (error) {
        console.error('[ProductDetail] Failed to load product:', error);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem(
      {
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.image || '',
      },
      quantity
    );

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  };

  // Days left on an admin-set promotion, or null when there is no live deal.
  const daysLeft = (() => {
    if (!product?.dealDeadline) return null;
    const deadline = new Date(product.dealDeadline);
    const diff = deadline.getTime() - Date.now();
    if (diff <= 0) return null;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <p className="text-midnight-300">Loading product...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl mb-4">💎</p>
          <h1 className="text-2xl font-bold text-white mb-2">Product not found</h1>
          <p className="text-midnight-400 mb-8">
            This item may have sold or been removed from the catalogue.
          </p>
          <Link href="/shop" className="inline-block px-6 py-3 btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const inCart = isInCart(product.id);

  return (
    <div className="min-h-screen bg-midnight-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-midnight-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-white transition-colors">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="card-glass rounded-2xl overflow-hidden border border-sapphire-500/20 aspect-square flex items-center justify-center bg-gradient-to-br from-sapphire-900/40 to-amethyst-900/40">
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-9xl">💎</span>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-sapphire-500/20 text-sapphire-300 rounded-full text-xs font-semibold">
                {product.category}
              </span>
              {product.featured && (
                <span className="px-3 py-1 bg-gold-500/20 text-gold-300 rounded-full text-xs font-semibold">
                  FEATURED
                </span>
              )}
              {daysLeft !== null && (
                <span className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-semibold">
                  ⏳ {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left on this offer
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">{product.title}</h1>

            <p className="text-4xl font-bold bg-gradient-to-r from-gold-300 to-rose-300 bg-clip-text text-transparent mb-6">
              ${product.price.toFixed(2)}
            </p>

            <p className="text-midnight-200 leading-relaxed mb-8 whitespace-pre-line">
              {product.description}
            </p>

            {/* Stock */}
            <div className="mb-6">
              {outOfStock ? (
                <span className="px-3 py-1.5 bg-rose-500/20 text-rose-300 rounded text-sm font-semibold">
                  Out of Stock
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded text-sm font-semibold">
                  In Stock — {product.stock} available
                </span>
              )}
            </div>

            {/* Quantity + add to cart */}
            {!outOfStock && (
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center border border-sapphire-500/30 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-3 text-white hover:bg-midnight-800 disabled:opacity-40 transition"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="px-6 py-3 text-white font-semibold min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="px-4 py-3 text-white hover:bg-midnight-800 disabled:opacity-40 transition"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[12rem] px-8 py-3 btn-primary font-semibold"
                >
                  {added ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
              </div>
            )}

            {inCart && !added && (
              <p className="text-sm text-emerald-400 mb-6">
                Already in your cart ({getItemQuantity(product.id)}).{' '}
                <Link href="/cart" className="underline hover:text-emerald-300">
                  View cart
                </Link>
              </p>
            )}

            {/* SKU — the number customers quote when tracking an order */}
            {product.trackingNumber && (
              <div className="card-glass p-4 rounded-lg border border-sapphire-500/20 mb-4">
                <p className="text-xs text-midnight-400 mb-1">Product Tracking Number (SKU)</p>
                <p className="text-white font-mono">{product.trackingNumber}</p>
                <p className="text-xs text-midnight-500 mt-2">
                  Quote this number in any enquiry about this item.
                </p>
              </div>
            )}

            <div className="border-t border-midnight-800 pt-6 mt-6 space-y-2 text-sm text-midnight-300">
              <p>🚚 Free worldwide shipping on all orders</p>
              <p>🛡️ 15 day money back guarantee</p>
              <p>💎 Authenticity guaranteed</p>
            </div>

            <Link
              href="/shop"
              className="inline-block mt-8 text-sapphire-400 hover:text-sapphire-300 transition-colors"
            >
              ← Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
