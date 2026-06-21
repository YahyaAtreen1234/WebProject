'use client';

import { useState, useEffect, useRef } from 'react';
import { trustBadges, certifications } from '@/data/aboutData';

export default function TrustBadgesSection() {
  const [visibleBadges, setVisibleBadges] = useState<number[]>([]);
  const badgesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-badge-index') || '0');
            setVisibleBadges((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    badgesRef.current.forEach((badge) => {
      if (badge) observer.observe(badge);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-midnight-900"
      aria-label="Trust and certifications"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-24">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Why Trust Us
          </h2>
          <p className="text-lg text-midnight-300 max-w-2xl mx-auto">
            Recognized for excellence, authenticity, and customer satisfaction
          </p>
        </div>

        {/* Trust Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              ref={(el) => {
                badgesRef.current[index] = el;
              }}
              data-badge-index={index}
              className={`group transition-all duration-700 transform ${
                visibleBadges.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="text-center p-6 sm:p-8 rounded-xl bg-gradient-to-br from-midnight-800 to-midnight-900 border border-sapphire-500/20 hover:border-sapphire-500/50 transition-all hover:shadow-lg hover:shadow-sapphire-500/20 hover:-translate-y-2">
                {/* Icon */}
                <div className="text-5xl sm:text-6xl mb-4">
                  {badge.icon}
                </div>

                {/* Stat */}
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sapphire-400 to-amethyst-400 bg-clip-text text-transparent mb-2">
                  {badge.stat}
                </p>

                {/* Label */}
                <p className="text-base sm:text-lg font-semibold text-white mb-2">
                  {badge.label}
                </p>

                {/* Description */}
                <p className="text-sm text-midnight-400">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications Section */}
        <div className="border-t border-sapphire-500/20 pt-16 sm:pt-24">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-12 text-center">
            Certifications & Partnerships
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 sm:p-8 rounded-xl bg-gradient-to-br from-midnight-800 to-midnight-900 border border-sapphire-500/20 hover:border-sapphire-500/50 transition-all"
              >
                {/* Placeholder for certification logos */}
                <div className="text-center">
                  <div className="text-4xl mb-2">🏅</div>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {cert.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Statement */}
        <div className="mt-16 sm:mt-24 p-6 sm:p-8 lg:p-12 rounded-xl bg-gradient-to-r from-sapphire-500/10 to-amethyst-500/10 border border-sapphire-500/30">
          <p className="text-center text-lg sm:text-xl text-midnight-200 leading-relaxed max-w-3xl mx-auto">
            Every gemstone in our collection is hand-selected, authenticated, and documented. We guarantee 100% authenticity with full certification. Your satisfaction is our promise.
          </p>
        </div>
      </div>
    </section>
  );
}
