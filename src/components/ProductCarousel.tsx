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
}

export default function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.length > 0 ? data : []);
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
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [products.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  if (loading) {
    return (
      <section className="section-spacing relative">
        <div className="container-gutter">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-4xl md:text-h2">Featured Products</h2>
          </div>
          <div className="text-center py-16 text-midnight-300">Loading...</div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="section-spacing relative">
        <div className="container-gutter">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-4xl md:text-h2">Featured Products</h2>
            <p className="text-lg text-midnight-300">No products available yet</p>
          </div>
        </div>
      </section>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <section className="section-spacing relative">
      <div className="container-gutter">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-4xl md:text-h2">Featured Products</h2>
          <p className="text-lg text-midnight-300 max-w-2xl mx-auto">
            Handpicked gemstones that showcase nature's most stunning creations
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="card-glass border border-sapphire-500/20 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Product Image */}
              <div className="flex items-center justify-center bg-gradient-to-br from-sapphire-600/20 to-amethyst-600/20 rounded-lg h-80">
                {currentProduct.image && currentProduct.image.startsWith('data:') ? (
                  <img
                    src={currentProduct.image}
                    alt={currentProduct.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-8xl opacity-50">💎</div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-white mb-4">{currentProduct.title}</h3>
                <p className="text-midnight-300 mb-4">{currentProduct.description}</p>

                <div className="mb-4">
                  <p className="text-4xl font-bold bg-gradient-to-r from-gold-300 to-rose-300 bg-clip-text text-transparent mb-2">
                    ${currentProduct.price.toFixed(2)}
                  </p>
                  <p className="text-midnight-400">
                    {currentProduct.stock > 0 ? (
                      <span className="text-emerald-400">✓ In Stock ({currentProduct.stock})</span>
                    ) : (
                      <span className="text-rose-400">Out of Stock</span>
                    )}
                  </p>
                </div>

                <Link href={`/shop?search=${currentProduct.title}`}>
                  <button className="px-6 py-3 bg-gradient-to-r from-sapphire-600 to-amethyst-600 text-white rounded-lg hover:from-sapphire-500 hover:to-amethyst-500 font-bold transition-all">
                    View Product
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 md:-translate-x-20 px-4 py-2 bg-sapphire-600 text-white rounded-full hover:bg-sapphire-500 transition-all font-bold text-2xl"
          >
            ‹
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 md:translate-x-20 px-4 py-2 bg-sapphire-600 text-white rounded-full hover:bg-sapphire-500 transition-all font-bold text-2xl"
          >
            ›
          </button>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? 'bg-sapphire-500 w-8' : 'bg-midnight-600 hover:bg-midnight-500'
                }`}
              />
            ))}
          </div>

          {/* Auto-rotation indicator */}
          <p className="text-center text-midnight-400 text-sm mt-4">Auto-rotating every 6 seconds</p>
        </div>
      </div>
    </section>
  );
}
