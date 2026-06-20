'use client';

import { useState } from 'react';
import { useCurrency, useChangeCurrency } from '@/src/currency/useCurrency';
import { SUPPORTED_CURRENCIES, getCurrencyCodes, CurrencyCode } from '@/src/currency/config';

export default function CurrencySwitcher() {
  const { currentCurrency, lastUpdated } = useCurrency();
  const changeCurrency = useChangeCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currentCurr = SUPPORTED_CURRENCIES[currentCurrency];

  const handleSelectCurrency = (code: CurrencyCode) => {
    changeCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className="relative group">
      {/* Currency Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
        title={lastUpdated ? `Rates updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading rates...'}
      >
        <span className="text-lg">{currentCurr.flag}</span>
        <span className="text-sm font-semibold hidden sm:inline">{currentCurr.code}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Currency Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-midnight-900 border border-emerald-500/30 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header with update info */}
          <div className="px-4 py-2 bg-midnight-800/50 border-b border-emerald-500/20">
            <p className="text-xs text-midnight-400">
              {lastUpdated
                ? `Updated: ${lastUpdated.toLocaleTimeString()}`
                : 'Fetching rates...'}
            </p>
          </div>

          {/* Currency List */}
          <div className="max-h-80 overflow-y-auto">
            {getCurrencyCodes().map((code) => {
              const curr = SUPPORTED_CURRENCIES[code];
              return (
                <button
                  key={code}
                  onClick={() => handleSelectCurrency(code)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-all text-left ${
                    currentCurrency === code
                      ? 'bg-emerald-500/20 border-l-2 border-emerald-500 text-emerald-400'
                      : 'hover:bg-emerald-500/10 text-midnight-300 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{curr.flag}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{curr.code}</p>
                    <p className="text-xs text-midnight-500">{curr.name}</p>
                  </div>
                  <span className="text-xs text-midnight-400">{curr.symbol}</span>
                  {currentCurrency === code && (
                    <span className="text-emerald-400">✓</span>
                  )}
                </button>
              );
            })}
          </div>
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
