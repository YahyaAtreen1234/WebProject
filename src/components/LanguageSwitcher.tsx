'use client';

import { useState } from 'react';
import { useLanguage, useChangeLanguage } from '@/src/i18n/useLanguage';
import { SUPPORTED_LANGUAGES } from '@/src/i18n/config';

export default function LanguageSwitcher() {
  const { currentLanguage } = useLanguage();
  const changeLanguage = useChangeLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES[currentLanguage];

  return (
    <div className="relative group">
      {/* Language Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sapphire-500/10 border border-sapphire-500/30 text-sapphire-400 hover:bg-sapphire-500/20 transition-all"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-semibold hidden sm:inline">{currentLang.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Language Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-midnight-900 border border-sapphire-500/30 rounded-lg shadow-lg z-50 overflow-hidden">
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => {
                changeLanguage(code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 transition-all text-left ${
                currentLanguage === code
                  ? 'bg-sapphire-500/20 border-l-2 border-sapphire-500 text-sapphire-400'
                  : 'hover:bg-sapphire-500/10 text-midnight-300 hover:text-white'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{lang.nativeName}</p>
                <p className="text-xs text-midnight-500">{lang.name}</p>
              </div>
              {currentLanguage === code && (
                <span className="text-sapphire-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
