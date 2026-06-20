'use client';

import { useState, useEffect, useRef } from 'react';
import { companyInfo, values } from '@/src/data/aboutData';

export default function MissionValuesSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-value-index') || '0');
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-midnight-950"
      aria-label="Company mission and values"
    >
      <div className="max-w-6xl mx-auto">
        {/* Mission Statement */}
        <div className="mb-16 sm:mb-24 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Our Mission
          </h2>
          <p className="text-lg sm:text-xl text-midnight-300 leading-relaxed">
            {companyInfo.mission}
          </p>
        </div>

        {/* Values Grid */}
        <div className="mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-12 text-center">
            Our Core Values
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                data-value-index={index}
                className={`group relative transition-all duration-700 transform ${
                  visibleCards.includes(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                {/* Card Background */}
                <div className="h-full rounded-xl bg-gradient-to-br from-midnight-800 to-midnight-900 border border-sapphire-500/20 p-6 sm:p-8 transition-all hover:border-sapphire-500/50 hover:shadow-lg hover:shadow-sapphire-500/20 hover:-translate-y-2">
                  {/* Icon */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center text-2xl sm:text-3xl mb-4 transition-all group-hover:scale-110`}>
                    {value.icon}
                  </div>

                  {/* Title */}
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-3">
                    {value.title}
                  </h4>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-midnight-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-16 sm:my-24 h-px bg-gradient-to-r from-transparent via-sapphire-500/50 to-transparent" />

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sapphire-400 to-amethyst-400 bg-clip-text text-transparent">
              {companyInfo.yearInBusiness}+
            </p>
            <p className="text-sm sm:text-base text-midnight-400 mt-2">
              Years in Business
            </p>
          </div>

          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sapphire-400 to-amethyst-400 bg-clip-text text-transparent">
              50K+
            </p>
            <p className="text-sm sm:text-base text-midnight-400 mt-2">
              Happy Customers
            </p>
          </div>

          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sapphire-400 to-amethyst-400 bg-clip-text text-transparent">
              45+
            </p>
            <p className="text-sm sm:text-base text-midnight-400 mt-2">
              Countries Served
            </p>
          </div>

          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sapphire-400 to-amethyst-400 bg-clip-text text-transparent">
              98.5%
            </p>
            <p className="text-sm sm:text-base text-midnight-400 mt-2">
              Satisfaction Rate
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
