'use client';

import Link from 'next/link';
import { useTranslation } from '@/src/i18n';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      className="relative min-h-screen lg:min-h-[70vh] w-full overflow-hidden flex items-center justify-center"
      aria-label="About us hero section"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-midnight-900 via-sapphire-900/20 to-midnight-900" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sapphire-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-amethyst-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-20 lg:py-0">
        {/* Main Heading */}
        <h1
          className={`text-4xl sm:text-5xl lg:text-7xl font-display font-bold mb-6 transition-all duration-1000 transform ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="bg-gradient-to-r from-sapphire-400 via-amethyst-400 to-sapphire-400 bg-clip-text text-transparent">
            StonesLand
          </span>
        </h1>

        {/* Tagline */}
        <p
          className={`text-xl sm:text-2xl lg:text-3xl text-midnight-300 mb-8 max-w-2xl mx-auto transition-all duration-1000 transform delay-200 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          Discover the World's Finest Gemstones & Minerals
        </p>

        {/* Subtitle */}
        <p
          className={`text-base sm:text-lg text-midnight-400 mb-12 max-w-xl mx-auto leading-relaxed transition-all duration-1000 transform delay-300 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          For over 9 years, we've been curating authentic, ethically sourced gemstones and minerals for collectors, enthusiasts, and investors worldwide.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 transform delay-400 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          <Link
            href="/gallery"
            className="px-8 py-3 sm:py-4 bg-gradient-to-r from-sapphire-600 to-sapphire-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-sapphire-500/50 transition-all hover:scale-105 active:scale-95"
          >
            Explore Collection
          </Link>
          <Link
            href="#our-story"
            className="px-8 py-3 sm:py-4 border-2 border-sapphire-500 text-sapphire-400 rounded-lg font-semibold hover:bg-sapphire-500/10 transition-all hover:scale-105 active:scale-95"
          >
            Our Story
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 animate-bounce">
          <p className="text-sm text-midnight-400">Scroll to explore</p>
          <svg
            className="w-5 h-5 text-sapphire-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
