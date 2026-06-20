export const SUPPORTED_CURRENCIES = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rate: 1.0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rate: 0.92,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rate: 0.79,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    rate: 1.36,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    rate: 1.52,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    rate: 149.50,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    rate: 83.12,
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    rate: 3.67,
  },
};

export const DEFAULT_CURRENCY = 'USD';

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

export const isValidCurrency = (code: string): code is CurrencyCode => {
  return code in SUPPORTED_CURRENCIES;
};

export const getCurrencyByCode = (code: string) => {
  if (isValidCurrency(code)) {
    return SUPPORTED_CURRENCIES[code];
  }
  return SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
};

export const getCurrencyCodes = () => {
  return Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[];
};

export const convertPrice = (
  amount: number,
  fromCurrency: CurrencyCode = DEFAULT_CURRENCY,
  toCurrency: CurrencyCode = DEFAULT_CURRENCY
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = SUPPORTED_CURRENCIES[fromCurrency].rate;
  const toRate = SUPPORTED_CURRENCIES[toCurrency].rate;

  // Convert to USD first, then to target currency
  const inUSD = amount / fromRate;
  const result = inUSD * toRate;

  return Math.round(result * 100) / 100;
};
