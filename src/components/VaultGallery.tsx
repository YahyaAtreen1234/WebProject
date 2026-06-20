'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  category: string;
}

export default function VaultGallery() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(products.length / itemsPerPage));
    }, 6000);

    return () => clearInterval(interval);
  }, [products.length]);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(products.length / itemsPerPage)) % Math.ceil(products.length / itemsPerPage));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(products.length / itemsPerPage));
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container-gutter">
          <h2 className="text-center text-4xl font-bold text-white mb-12">THE VAULT GALLERY</h2>
          <div className="text-center text-midnight-300">Loading gallery...</div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16">
        <div className="container-gutter">
          <h2 className="text-center text-4xl font-bold text-white mb-12">THE VAULT GALLERY</h2>
          <div className="text-center text-midnight-300">No products available yet</div>
        </div>
      </section>
    );
  }

  const totalSlides = Math.ceil(products.length / itemsPerPage);
  const startIdx = currentSlide * itemsPerPage;
  const visibleProducts = products.slice(startIdx, startIdx + itemsPerPage);

  return (
    <section className="py-16 px-4">
      <div className="container-gutter">
        {/* Header with top dots */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide ? 'bg-rose-500 w-3 h-3' : 'bg-midnight-500 hover:bg-midnight-400'
              }`}
            />
          ))}
        </div>

        {/* Gallery Title */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-midnight-600"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-white whitespace-nowrap">THE VAULT GALLERY</h2>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-midnight-600"></div>
        </div>

        {/* Products Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {visibleProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/shop?search=${product.title}`}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-midnight-900 border border-midnight-700 hover:border-sapphire-500/50 transition-all">
                  {/* Product Image */}
                  <div className="relative h-64 bg-gradient-to-br from-midnight-800 to-midnight-900 flex items-center justify-center overflow-hidden">
                    {product.image && product.image.startsWith('data:') ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-6xl opacity-30 group-hover:scale-110 transition-transform duration-300">💎</div>
                    )}

                    {/* Featured Badge */}
                    {index === 0 && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-gold-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ON DISPLAY
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-sapphire-300 transition-colors">
                      {product.title}
                    </h3>

                    {/* Price */}
                    <div className="mb-2">
                      {product.price > 0 ? (
                        <p className="text-lg font-bold text-gold-400">${product.price.toFixed(2)}</p>
                      ) : (
                        <p className="text-sm text-midnight-400">Price on Request</p>
                      )}
                    </div>

                    {/* Category */}
                    <p className="text-xs text-midnight-400 capitalize">{product.category}</p>

                    {/* Stock Status */}
                    <div className="mt-2 pt-2 border-t border-midnight-700">
                      {product.stock > 0 ? (
                        <p className="text-xs text-emerald-400">✓ In Stock</p>
                      ) : (
                        <p className="text-xs text-rose-400">Sold Out</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-12 px-3 py-2 bg-midnight-800 border border-midnight-700 text-white rounded-lg hover:bg-sapphire-600 hover:border-sapphire-500 transition-all font-bold"
              >
                ‹
              </button>

              <button
                onClick={goToNext}
                className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-12 px-3 py-2 bg-midnight-800 border border-midnight-700 text-white rounded-lg hover:bg-sapphire-600 hover:border-sapphire-500 transition-all font-bold"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Bottom Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide ? 'bg-sapphire-500 w-8' : 'bg-midnight-600 hover:bg-midnight-500'
              }`}
            />
          ))}
        </div>

        {/* Info Text */}
        <p className="text-center text-midnight-400 text-sm mt-4">
          Auto-rotating every 6 seconds • Slide {currentSlide + 1} of {totalSlides}
        </p>
      </div>
    </section>
  );
}
