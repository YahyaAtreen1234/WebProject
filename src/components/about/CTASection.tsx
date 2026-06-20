'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CTASection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-midnight-900 via-midnight-950 to-midnight-900 relative overflow-hidden"
      aria-label="Call to action"
    >
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sapphire-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amethyst-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Heading */}
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 transition-all duration-1000 transform ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          Ready to Start Your Collection?
        </h2>

        {/* Subheading */}
        <p
          className={`text-lg sm:text-xl text-midnight-300 mb-8 sm:mb-12 leading-relaxed transition-all duration-1000 transform delay-200 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          Explore our curated collection of authentic gemstones and minerals. Whether you're a seasoned collector or just starting your journey, we have something special for you.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 transform delay-300 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Primary CTA */}
          <Link
            href="/gallery"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sapphire-600 to-sapphire-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-sapphire-500/50 transition-all hover:scale-105 active:scale-95 text-center"
          >
            Browse Collection
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-4 border-2 border-sapphire-500 text-sapphire-400 rounded-lg font-semibold hover:bg-sapphire-500/10 transition-all hover:scale-105 active:scale-95 text-center"
          >
            Schedule a Consultation
          </Link>
        </div>

        {/* Trust Statement */}
        <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-sapphire-500/20">
          <p className="text-sm text-midnight-400 flex items-center justify-center gap-2">
            <span>✓</span>
            <span>30-day money-back guarantee</span>
            <span>•</span>
            <span>Free worldwide shipping on orders over $500</span>
            <span>•</span>
            <span>Lifetime authenticity guarantee</span>
          </p>
        </div>
      </div>
    </section>
  );
}
