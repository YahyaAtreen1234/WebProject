'use client';

import Link from 'next/link';
import ProductCarousel from '@/src/components/ProductCarousel';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-sapphire-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-amethyst-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container-gutter relative z-10 text-center">
          <h1 className="mb-6 text-5xl md:text-h1">Welcome to StonesLand</h1>
          <p className="text-xl md:text-2xl text-midnight-200 max-w-3xl mx-auto mb-12 leading-relaxed">
            Discover the world's most exquisite gemstones and minerals. Each piece tells a story of Earth's magnificent beauty, crafted by nature over millennia.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link href="/shop" className="btn-primary">
              Explore Collection
            </Link>
            <Link href="/gallery" className="btn-secondary">
              View Gallery
            </Link>
          </div>

          {/* Floating cards below hero */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '💎', title: 'Premium Quality', desc: 'Authentic gemstones certified worldwide' },
              { icon: '🌍', title: 'Ethically Sourced', desc: 'Responsibly mined from trusted suppliers' },
              { icon: '✨', title: 'Lifetime Value', desc: 'Investment-grade minerals that appreciate' },
            ].map((item, i) => (
              <div key={i} className="card-glass backdrop-blur-md p-6 rounded-xl hover:shadow-lg hover:shadow-sapphire-500/20">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-midnight-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel - Auto-rotates every 6 seconds */}
      <ProductCarousel />

      {/* Category Section */}
      <section className="section-spacing relative">
        <div className="container-gutter">
          <h2 className="text-center mb-12 text-4xl md:text-h2">Shop by Category</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Raw Minerals', icon: '🪨', desc: 'Natural unpolished specimens', color: 'emerald' },
              { name: 'Polished Gems', icon: '✨', desc: 'Refined and finished pieces', color: 'sapphire' },
              { name: 'Rare Collectibles', icon: '👑', desc: 'Exclusive hard-to-find items', color: 'amethyst' },
            ].map((cat, i) => (
              <Link key={i} href={`/shop?category=${cat.name.toLowerCase()}`}>
                <div className={`bg-gradient-to-br from-${cat.color}-600/30 to-${cat.color}-800/30 border border-${cat.color}-500/50 rounded-2xl p-12 text-center hover:border-${cat.color}-400 hover:shadow-lg hover:shadow-${cat.color}-500/30 cursor-pointer transition-all duration-300 group`}>
                  <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">{cat.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
                  <p className="text-midnight-300">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-spacing relative">
        <div className="container-gutter">
          <div className="bg-gradient-to-r from-sapphire-600/40 via-amethyst-600/40 to-emerald-600/40 border border-sapphire-500/30 rounded-3xl p-12 md:p-16 text-center backdrop-blur-xl">
            <h2 className="text-3xl md:text-h3 text-white mb-4">Get Exclusive Offers</h2>
            <p className="text-midnight-200 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for early access to new collections and special member-only discounts.
            </p>
            <div className="flex gap-4 max-w-md mx-auto flex-col sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400 focus:ring-2 focus:ring-sapphire-400/50"
              />
              <button className="btn-accent whitespace-nowrap">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
