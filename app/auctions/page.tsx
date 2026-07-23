'use client';

import Link from 'next/link';
import { useState } from 'react';

interface AuctionItem {
  id: string;
  title: string;
  currentBid: number;
  bids: number;
  timeLeft: string;
  image: string;
  category: string;
}

export default function AuctionsPage() {
  const [sortBy, setSortBy] = useState('ending-soon');

  const auctionItems: AuctionItem[] = [
    {
      id: '1',
      title: 'Rare Tanzanite Crystal - Tanzania',
      currentBid: 2500,
      bids: 15,
      timeLeft: '2 hours 30 minutes',
      image: '💎',
      category: 'Tanzanite',
    },
    {
      id: '2',
      title: 'Premium Emerald Specimen - Colombia',
      currentBid: 3200,
      bids: 22,
      timeLeft: '5 hours 45 minutes',
      image: '💎',
      category: 'Emerald',
    },
    {
      id: '3',
      title: 'Authentic Ruby Cluster - Myanmar',
      currentBid: 4100,
      bids: 31,
      timeLeft: '1 day 3 hours',
      image: '💎',
      category: 'Ruby',
    },
    {
      id: '4',
      title: 'Blue Sapphire Gem - Sri Lanka',
      currentBid: 3500,
      bids: 18,
      timeLeft: '1 day 8 hours',
      image: '💎',
      category: 'Sapphire',
    },
    {
      id: '5',
      title: 'Golden Tourmaline - Brazil',
      currentBid: 1800,
      bids: 12,
      timeLeft: '2 days 4 hours',
      image: '💎',
      category: 'Tourmaline',
    },
    {
      id: '6',
      title: 'Precious Amethyst Geode - Uruguay',
      currentBid: 950,
      bids: 8,
      timeLeft: '3 days',
      image: '💎',
      category: 'Amethyst',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Live Auctions</h1>
          <p className="text-xl text-gray-600">Bid on exclusive gemstones and minerals from around the world</p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b py-6 px-4 sm:px-6 sticky top-[200px] z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:border-black"
            >
              <option value="ending-soon">Ending Soon</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="most-bids">Most Bids</option>
            </select>
          </div>
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold">{auctionItems.length}</span> auctions
          </p>
        </div>
      </section>

      {/* Auctions Grid */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctionItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
              >
                {/* Image */}
                <div className="bg-gradient-to-b from-gray-800 to-black h-48 flex items-center justify-center">
                  <span className="text-7xl">{item.image}</span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-black line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{item.category}</p>

                  {/* Bid Info */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Current Bid</p>
                      <p className="text-2xl font-bold text-black">${item.currentBid.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        <span className="font-bold text-black">{item.bids}</span> bids
                      </span>
                      <span className="text-red-600 font-bold">
                        ⏱️ {item.timeLeft}
                      </span>
                    </div>
                  </div>

                  {/* Place Bid Button */}
                  <button className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition">
                    Place Bid
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-16 bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">How to Bid</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-2">1. Register</h3>
                <p className="text-gray-700">Create an account or sign in to start bidding on auctions.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">2. Place Your Bid</h3>
                <p className="text-gray-700">Enter your bid amount. You must bid higher than the current bid.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">3. Win & Pay</h3>
                <p className="text-gray-700">If you're the highest bidder when auction ends, you win! Pay securely online.</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Bidding?</h2>
            <Link
              href="/login"
              className="inline-block bg-black text-white font-bold px-8 py-3 rounded-lg hover:bg-gray-800"
            >
              Sign In to Bid
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
