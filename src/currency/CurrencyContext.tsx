'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode, DEFAULT_CURRENCY, isValidCurrency, SUPPORTED_CURRENCIES } from './config';

interface CurrencyContextType {
  currentCurrency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rates: { [key in CurrencyCode]: number };
  isLoading: boolean;
  lastUpdated: Date | null;
}

export const CurrencyContext = createContext<CurrencyContextType | null>(null);

// Fallback rates (for offline support)
const FALLBACK_RATES: { [key in CurrencyCode]: number } = Object.entries(
  SUPPORTED_CURRENCIES
).reduce((acc, [code, data]) => {
  acc[code as CurrencyCode] = data.rate;
  return acc;
}, {} as { [key in CurrencyCode]: number });

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<{ [key in CurrencyCode]: number }>(FALLBACK_RATES);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred-currency');
    if (savedCurrency && isValidCurrency(savedCurrency)) {
      setCurrentCurrency(savedCurrency);
    }

    // Fetch real-time exchange rates
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    try {
      // Using exchangerate-api.com free tier
      // Alternative: fixer.io, openexchangerates.org
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        const newRates: { [key in CurrencyCode]: number } = { ...FALLBACK_RATES };

        // Update rates from API
        Object.keys(SUPPORTED_CURRENCIES).forEach((code) => {
          if (code in data.rates) {
            newRates[code as CurrencyCode] = data.rates[code];
          }
        });

        setRates(newRates);
        setLastUpdated(new Date());

        // Cache rates with timestamp
        localStorage.setItem('exchange-rates', JSON.stringify({
          rates: newRates,
          timestamp: new Date().toISOString(),
        }));
      }
    } catch (error) {
      console.warn('Failed to fetch exchange rates, using fallback:', error);

      // Try to load cached rates
      const cached = localStorage.getItem('exchange-rates');
      if (cached) {
        try {
          const { rates: cachedRates, timestamp } = JSON.parse(cached);
          setRates(cachedRates);
          setLastUpdated(new Date(timestamp));
        } catch {
          // If cache is invalid, use fallback
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCurrency = (currency: CurrencyCode) => {
    setCurrentCurrency(currency);
    localStorage.setItem('preferred-currency', currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrency: handleSetCurrency,
        rates,
        isLoading,
        lastUpdated,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
