'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  image?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [promoIndex, setPromoIndex] = useState(0);

  const heroEvents = [
    'Sainte Marie 61st Show France 2026',
    'Nanjing (International) Mineral, Gemstone & Fossil Expo 2026',
    'The Tucson Gem & Fine Mineral Show 2026',
    'The Munich Show 2025',
  ];

  const promotions = [
    { title: 'FREE WORLDWIDE SHIPPING', subtitle: 'On all orders', color: 'from-yellow-400 to-amber-500' },
    { title: '15 DAY MONEY BACK', subtitle: 'Guaranteed satisfaction', color: 'from-blue-400 to-cyan-500' },
    { title: 'AUTHENTIC GEMSTONES', subtitle: 'Premium quality certified', color: 'from-purple-400 to-pink-500' },
    { title: 'EXPERT SUPPORT', subtitle: '24/7 customer service', color: 'from-emerald-400 to-teal-500' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prevIndex) => (prevIndex + 1) % heroEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroEvents.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prevIndex) => (prevIndex + 1) % promotions.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [promotions.length]);

  const fetchProducts = async () => {
    try {
      const [allResponse, featuredResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/products?featured=true'),
      ]);

      if (allResponse.ok) {
        setProducts(await allResponse.json());
      }
      if (featuredResponse.ok) {
        setFeaturedProducts(await featuredResponse.json());
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'BERYL', icon: '💎' },
    { name: 'BROOKITE', icon: '💎' },
    { name: 'BRUCITE', icon: '💎' },
    { name: 'CALCITE', icon: '💎' },
    { name: 'CORUNDUM', icon: '💎' },
    { name: 'EPIDOTE', icon: '💎' },
    { name: 'FLUORITE', icon: '💎' },
    { name: 'GARNET', icon: '💎' },
    { name: 'GOLD', icon: '💎' },
    { name: 'PYRITE', icon: '💎' },
    { name: 'QUARTZ', icon: '💎' },
    { name: 'RHODOCHROSITE', icon: '💎' },
  ];

  const vaultProducts = products.slice(0, 5);
  const newArrivals = products.slice(5, 10);
  const allProducts = products;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Carousel Section */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">{heroEvents[heroIndex]}</h1>
          <div className="flex justify-center gap-2 mb-8">
            {heroEvents.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`w-3 h-3 rounded-full ${i === heroIndex ? 'bg-red-600' : 'bg-gray-400'}`}
              />
            ))}
          </div>
          <Link href="/gallery" className="inline-block bg-black text-white font-bold px-8 py-3 rounded hover:bg-gray-800">
            VIEW ALL
          </Link>
        </div>
      </section>

      {/* Promotional Banner Carousel */}
      <section className="bg-black py-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative flex items-center justify-between min-h-64">
            {/* Left Arrow */}
            <button
              onClick={() => setPromoIndex((prevIndex) => (prevIndex - 1 + promotions.length) % promotions.length)}
              className="absolute left-0 z-10 p-3 text-white hover:bg-white/10 rounded-full transition"
              aria-label="Previous promotion"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Promo Content */}
            <div className="flex-1 flex items-center justify-center px-12">
              <div className="text-center max-w-2xl">
                <p className="text-gray-400 text-lg mb-4 uppercase tracking-widest">{promotions[promoIndex].subtitle}</p>
                <h2 className={`text-6xl font-black mb-8 bg-gradient-to-r ${promotions[promoIndex].color} bg-clip-text text-transparent uppercase tracking-tight`}>
                  {promotions[promoIndex].title}
                </h2>
                <Link
                  href="/shop"
                  className="inline-block bg-white text-black font-bold px-8 py-3 rounded hover:bg-gray-200 transition"
                >
                  Shop Now
                </Link>
              </div>

              {/* Gemstone Image Placeholder */}
              <div className="absolute right-12 h-64 w-64 flex items-center justify-center">
                <div className="text-8xl">💎</div>
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => setPromoIndex((prevIndex) => (prevIndex + 1) % promotions.length)}
              className="absolute right-0 z-10 p-3 text-white hover:bg-white/10 rounded-full transition"
              aria-label="Next promotion"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          {/* Promo Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {promotions.map((_, i) => (
              <button
                key={i}
                onClick={() => setPromoIndex(i)}
                className={`w-2 h-2 rounded-full transition ${i === promoIndex ? 'bg-white' : 'bg-gray-600'}`}
                aria-label={`Go to promotion ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section - driven by the admin "Featured" checkbox */}
      {!loading && featuredProducts.length > 0 && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-center text-3xl font-bold mb-12">FEATURED PRODUCTS</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredProducts.map((product) => (
                <Link key={product.id} href="/shop">
                  <div className="bg-black rounded-2xl p-6 text-white text-center cursor-pointer hover:opacity-90 transition h-full relative">
                    <span className="absolute top-4 left-4 bg-gold-500 text-black text-xs font-bold px-2 py-1 rounded">
                      FEATURED
                    </span>
                    <div className="bg-gradient-to-b from-gray-700 to-black h-40 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">💎</span>
                      )}
                    </div>
                    <p className="font-bold mb-2 line-clamp-2 text-sm">{product.title}</p>
                    <p className="text-gray-400 mb-2 text-sm">{product.category}</p>
                    <p className="font-bold text-lg text-gold-300">${product.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-2">Stock: {product.stock}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link href="/shop?sort=featured" className="inline-block bg-black text-white font-bold px-8 py-3 rounded hover:bg-gray-800">
                VIEW ALL FEATURED
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* All Products Section - Grid View */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-12">ALL PRODUCTS</h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">Loading products...</p>
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No products available</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {allProducts.map((product) => (
                  <Link key={product.id} href={`/shop`}>
                    <div className="bg-black rounded-2xl p-6 text-white text-center cursor-pointer hover:opacity-90 transition h-full">
                      <div className="bg-gradient-to-b from-gray-700 to-black h-40 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl">💎</span>
                        )}
                      </div>
                      <p className="font-bold mb-2 line-clamp-2 text-sm">{product.title}</p>
                      <p className="text-gray-400 mb-2 text-sm">{product.category}</p>
                      <p className="font-bold text-lg text-gold-300">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 mt-2">Stock: {product.stock}</p>
                      <div className="flex justify-center gap-3 mt-4">
                        <button className="text-xl hover:scale-110">⟷</button>
                        <button className="text-xl hover:scale-110">♡</button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center">
                <Link href="/shop" className="inline-block bg-black text-white font-bold px-8 py-3 rounded hover:bg-gray-800">
                  VIEW MORE PRODUCTS
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-12">FEATURED CATEGORIES</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {categories.map((cat, i) => (
              <Link key={i} href={`/gallery?search=${cat.name}`}>
                <div className="bg-black rounded-2xl p-6 text-white text-center cursor-pointer hover:opacity-80 transition">
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <p className="font-bold text-sm uppercase">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/gallery" className="inline-block bg-black text-white font-bold px-8 py-3 rounded hover:bg-gray-800">
              VIEW ALL CATEGORIES
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black text-white rounded-2xl p-12 flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-2">💎 Fine Art Gems</h3>
            <p className="text-lg mb-6">The Same Legacy. A New Brilliance.</p>
            <Link href="/shop" className="bg-white text-black font-bold px-6 py-3 rounded w-fit hover:bg-gray-200">
              Explore Gems
            </Link>
          </div>
          <div className="bg-black text-white rounded-2xl p-12 flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-2">🔨 FAM Auctions</h3>
            <p className="text-lg mb-6">Your Trusted Auction Partner</p>
            <Link href="/auctions" className="bg-white text-black font-bold px-6 py-3 rounded w-fit hover:bg-gray-200">
              Join the Auction
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
