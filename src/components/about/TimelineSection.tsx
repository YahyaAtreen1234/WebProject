'use client';

import { useState, useEffect, useRef } from 'react';
import { timeline } from '@/data/aboutData';

interface TimelineItem {
  year: number;
  title: string;
  description: string;
  icon: string;
}

export default function TimelineSection() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const items = document.querySelectorAll('[data-timeline-item]');
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="our-story"
      className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-midnight-900 to-midnight-950"
      aria-label="Company timeline"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-24">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Our Journey
          </h2>
          <p className="text-lg text-midnight-300 max-w-2xl mx-auto">
            From a small gemstone shop to a trusted international marketplace
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Vertical Line - Hidden on Mobile */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-sapphire-500 via-amethyst-500 to-sapphire-500" />

          {/* Timeline Items */}
          <div className="space-y-12 sm:space-y-16">
            {timeline.map((item: TimelineItem, index: number) => (
              <div
                key={index}
                data-timeline-item
                data-index={index}
                className={`relative transition-all duration-700 transform ${
                  visibleItems.includes(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                {/* Desktop Layout - Alternating */}
                <div className="hidden md:grid md:grid-cols-2 gap-8 items-center">
                  {/* Left side (even items) */}
                  {index % 2 === 0 && (
                    <>
                      <div className="text-right pr-8">
                        <div className="space-y-2">
                          <p className="text-sapphire-400 font-semibold text-sm uppercase tracking-wider">
                            {item.year}
                          </p>
                          <h3 className="text-2xl font-bold text-white">
                            {item.title}
                          </h3>
                          <p className="text-midnight-300 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Timeline Dot */}
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sapphire-500 to-amethyst-500 flex items-center justify-center text-2xl shadow-lg shadow-sapphire-500/50">
                          {item.icon}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Right side (odd items) */}
                  {index % 2 === 1 && (
                    <>
                      {/* Timeline Dot */}
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amethyst-500 to-sapphire-500 flex items-center justify-center text-2xl shadow-lg shadow-amethyst-500/50">
                          {item.icon}
                        </div>
                      </div>

                      <div className="pl-8">
                        <div className="space-y-2">
                          <p className="text-sapphire-400 font-semibold text-sm uppercase tracking-wider">
                            {item.year}
                          </p>
                          <h3 className="text-2xl font-bold text-white">
                            {item.title}
                          </h3>
                          <p className="text-midnight-300 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Layout - Single Column */}
                <div className="md:hidden flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sapphire-500 to-amethyst-500 flex items-center justify-center text-xl flex-shrink-0 shadow-lg">
                      {item.icon}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-1 h-12 bg-gradient-to-b from-sapphire-500 to-transparent mt-2" />
                    )}
                  </div>

                  <div className="pt-1 pb-4">
                    <p className="text-sapphire-400 font-semibold text-xs uppercase tracking-wider mb-1">
                      {item.year}
                    </p>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-midnight-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
