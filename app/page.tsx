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
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  const heroEvents = [
    'Sainte Marie 61st Show France 2026',
    'Nanjing (International) Mineral, Gemstone & Fossil Expo 2026',
    'The Tucson Gem & Fine Mineral Show 2026',
    'The Munich Show 2025',
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
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
