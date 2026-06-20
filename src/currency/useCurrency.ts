'use client';

import { useContext, useCallback, useMemo } from 'react';
import { CurrencyContext } from './CurrencyContext';
import { CurrencyCode, convertPrice as convertPriceUtil, SUPPORTED_CURRENCIES } from './config';

export const useCurrency = () => {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }

  return context;
};

export const useConvertPrice = () => {
  const { currentCurrency, rates } = useCurrency();

  const convertPrice = useCallback(
    (price: number, fromCurrency: CurrencyCode = 'USD'): number => {
      if (fromCurrency === currentCurrency) {
        return price;
      }

      const fromRate = rates[fromCurrency];
      const toRate = rates[currentCurrency];

      if (!fromRate || !toRate) {
        return price; // Fallback
      }

      const inUSD = price / fromRate;
      const converted = inUSD * toRate;

      return Math.round(converted * 100) / 100;
    },
    [currentCurrency, rates]
  );

  return convertPrice;
};

export const useFormatPrice = () => {
  const { currentCurrency } = useCurrency();
  const convertPrice = useConvertPrice();

  const formatPrice = useCallback(
    (price: number, fromCurrency: CurrencyCode = 'USD'): string => {
      const convertedPrice = convertPrice(price, fromCurrency);
      const currency = SUPPORTED_CURRENCIES[currentCurrency];

      return `${currency.symbol}${convertedPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [convertPrice, currentCurrency]
  );

  return formatPrice;
};

export const useChangeCurrency = () => {
  const { setCurrency } = useCurrency();

  return useCallback((currency: CurrencyCode) => {
    setCurrency(currency);
  }, [setCurrency]);
};

export const useCurrencyInfo = () => {
  const { currentCurrency } = useCurrency();

  return useMemo(
    () => SUPPORTED_CURRENCIES[currentCurrency],
    [currentCurrency]
  );
};
