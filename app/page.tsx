'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [vaultIndex, setVaultIndex] = useState(0);
  const [testimonyIndex, setTestimonyIndex] = useState(0);

  const heroEvents = [
    'Sainte Marie 61st Show France 2026',
    'Nanjing (International) Mineral, Gemstone & Fossil Expo 2026',
    'The Tucson Gem & Fine Mineral Show 2026',
    'The Munich Show 2025',
  ];

  const vaultProducts = [
    { name: 'Elbaite Tourmaline – Brazil', price: 'POR', img: '💎' },
    { name: 'Beryl var. Heliodor – Ukraine', price: 'POR', img: '💎' },
    { name: 'Tourmaline var. Elbaite – Congo', price: 'POR', img: '💎' },
    { name: 'Lagoon Tourmaline – Afghanistan', price: 'POR', img: '💎' },
    { name: 'Tourmaline var. Elbaite – Congo', price: 'POR', img: '💎' },
  ];

  const newArrivals = [
    { name: 'Aquamarine with Pollucite and Muscovite – Pakistan', price: 'POR' },
    { name: 'Pyrite on Limonite – Pakistan', price: '$500.00' },
    { name: 'Dog Tooth Calcite on Fluorite – Pakistan', price: 'POR' },
    { name: 'Topaz – Pakistan', price: '$6,500.00' },
    { name: 'Calcite – China', price: '$6,500.00' },
  ];

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
    { name: 'RUTILE', icon: '💎' },
    { name: 'SPODUMENE', icon: '💎' },
    { name: 'TANZANITE', icon: '💎' },
    { name: 'TOPAZ', icon: '💎' },
    { name: 'TOURMALINE', icon: '💎' },
    { name: 'VÄYRYNENITE', icon: '💎' },
  ];

  const testimonials = [
    {
      text: 'Very nice mineral specimen. Very flexible dealer. Good choice for beginner collector.',
      rating: 5,
      author: 'Rhodo Nchawning',
      avatar: '👨',
    },
    {
      text: 'Fine Art Minerals is the best source of high quality mineral specimens from Pakistan, Afghanistan.',
      rating: 5,
      author: 'Simone Del zotto',
      avatar: '👨',
    },
    {
      text: 'Nice team! Great communication. Best stones. Thank you!',
      rating: 5,
      author: 'Алексей Вантеев',
      avatar: '👨',
    },
  ];

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

      {/* Vault Gallery Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-4">THE VAULT GALLERY</h2>
          <div className="flex justify-center gap-2 mb-8">
            {vaultProducts.map((_, i) => (
              <button
                key={i}
                onClick={() => setVaultIndex(i)}
                className={`w-3 h-3 rounded-full ${i === vaultIndex ? 'bg-red-600' : 'bg-gray-400'}`}
              />
            ))}
          </div>

          <div className="flex overflow-x-auto gap-4 justify-center pb-8">
            {[0, 1, 2, 3, 4].map((offset) => {
              const i = (vaultIndex + offset) % vaultProducts.length;
              return (
                <div key={i} className="flex-shrink-0 w-64 bg-black rounded-2xl p-6 text-white text-center">
                  <div className="bg-gradient-to-b from-gray-700 to-black h-48 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-6xl">{vaultProducts[i].img}</span>
                  </div>
                  <p className="font-bold mb-2">{vaultProducts[i].name}</p>
                  <p className="text-gray-400">{vaultProducts[i].price}</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <button className="text-2xl hover:scale-110">⟷</button>
                    <button className="text-2xl hover:scale-110">♡</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/gallery" className="inline-block bg-black text-white font-bold px-8 py-3 rounded hover:bg-gray-800">
              VIEW ALL
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-8">NEW ARRIVALS</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {newArrivals.map((product, i) => (
              <div key={i} className="bg-black rounded-2xl p-4 text-white text-center">
                <div className="bg-gradient-to-b from-gray-700 to-black h-40 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-5xl">💎</span>
                </div>
                <p className="font-bold text-sm mb-2">{product.name}</p>
                <p className="text-gray-400 text-sm">{product.price}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/shop" className="inline-block bg-black text-white font-bold px-8 py-3 rounded hover:bg-gray-800">
              VIEW ALL
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-12">FEATURED CATEGORIES</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {categories.slice(0, 12).map((cat, i) => (
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
              VIEW ALL
            </Link>
          </div>
        </div>
      </section>

      {/* Client Testimonials Section */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-12">CLIENT TESTIMONIALS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, i) => (
              <div key={i} className="bg-white rounded-lg p-8 shadow-lg">
                <div className="text-4xl mb-4">{test.avatar}</div>
                <div className="flex justify-center gap-1 mb-4">
                  {Array(test.rating).fill('⭐').map((star, j) => (
                    <span key={j}>{star}</span>
                  ))}
                </div>
                <p className="text-gray-700 text-center mb-4 italic">"{test.text}"</p>
                <div className="bg-black text-white text-center py-2 rounded font-bold">
                  {test.author}
                </div>
              </div>
            ))}
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

      {/* Exhibitions Section */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-12">EXHIBITIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl h-48 flex items-center justify-center">
                <span className="text-6xl">📸</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
