'use client';

import { useState, useEffect, useRef } from 'react';
import { teamMembers } from '@/data/aboutData';

export default function TeamSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-member-index') || '0');
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return '💼';
      case 'twitter':
        return '𝕏';
      case 'github':
        return '💻';
      default:
        return '🔗';
    }
  };

  return (
    <section
      className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-midnight-950 to-midnight-900"
      aria-label="Team members"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-24">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-midnight-300 max-w-2xl mx-auto">
            Passionate experts dedicated to bringing you the finest gemstones and minerals
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              data-member-index={index}
              className={`group transition-all duration-700 transform ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              {/* Team Card */}
              <div className="relative h-full rounded-xl overflow-hidden bg-midnight-800 border border-sapphire-500/20 transition-all hover:border-sapphire-500/50 hover:shadow-lg hover:shadow-sapphire-500/20 hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative h-64 sm:h-72 bg-gradient-to-br from-sapphire-500/20 to-amethyst-500/20 overflow-hidden">
                  {/* Placeholder - Replace with actual images */}
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    👤
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  {/* Name */}
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                    {member.name}
                  </h3>

                  {/* Role */}
                  <p className="text-sm text-sapphire-400 font-semibold mb-3">
                    {member.role}
                  </p>

                  {/* Bio */}
                  <p className="text-sm text-midnight-400 mb-4 line-clamp-3">
                    {member.bio}
                  </p>

                  {/* Social Links */}
                  <div className="flex gap-2">
                    {Object.entries(member.social).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-sapphire-500/20 hover:bg-sapphire-500/40 transition-colors flex items-center justify-center text-sm hover:text-sapphire-300"
                        aria-label={`${member.name}'s ${platform} profile`}
                        title={platform}
                      >
                        {getSocialIcon(platform)}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join Team CTA */}
        <div className="mt-16 sm:mt-24 text-center">
          <p className="text-lg text-midnight-300 mb-6">
            Want to join our team?
          </p>
          <a
            href="/careers"
            className="inline-block px-8 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-sapphire-500/50 transition-all hover:scale-105 active:scale-95"
          >
            View Open Positions
          </a>
        </div>
      </div>
    </section>
  );
}
