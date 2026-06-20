# Multi-Currency System - Usage Examples

## Basic Price Display

```tsx
import { PriceDisplay } from '@/src/components/PriceDisplay';

export default function ProductCard() {
  return (
    <div>
      <h3>Diamond Ring</h3>
      {/* Price automatically converts to selected currency */}
      <PriceDisplay 
        amount={1500} 
        fromCurrency="USD"
        size="lg"
      />
    </div>
  );
}
```

## Display with Original Price Reference

```tsx
import { PriceDisplayWithOriginal } from '@/src/components/PriceDisplay';

export default function SaleItem() {
  return (
    <PriceDisplayWithOriginal
      amount={899}
      fromCurrency="USD"
      showConversion={true}
    />
  );
}
```

## Manual Price Conversion

```tsx
'use client';

import { useFormatPrice, useConvertPrice } from '@/src/currency/useCurrency';

export default function PriceList() {
  const formatPrice = useFormatPrice();
  const convertPrice = useConvertPrice();

  // Format and convert in one step
  const displayPrice = formatPrice(500, 'USD');

  // Or just convert without formatting
  const numericPrice = convertPrice(500, 'USD');

  return (
    <div>
      <p>Formatted: {displayPrice}</p>
      <p>Numeric: {numericPrice}</p>
    </div>
  );
}
```

## Access Current Currency Info

```tsx
'use client';

import { useCurrencyInfo } from '@/src/currency/useCurrency';

export default function CurrencyBadge() {
  const currencyInfo = useCurrencyInfo();

  return (
    <div>
      <p>Flag: {currencyInfo.flag}</p>
      <p>Symbol: {currencyInfo.symbol}</p>
      <p>Name: {currencyInfo.name}</p>
    </div>
  );
}
```

## Change Currency Programmatically

```tsx
'use client';

import { useChangeCurrency } from '@/src/currency/useCurrency';

export default function QuickChangeButton() {
  const changeCurrency = useChangeCurrency();

  return (
    <button onClick={() => changeCurrency('EUR')}>
      Switch to Euro
    </button>
  );
}
```

## Get Full Currency Context

```tsx
'use client';

import { useCurrency } from '@/src/currency/useCurrency';

export default function CurrencyInfo() {
  const { 
    currentCurrency,     // 'USD' | 'EUR' | 'GBP' | etc
    rates,               // { USD: 1, EUR: 0.92, GBP: 0.79, ... }
    isLoading,           // boolean
    lastUpdated,         // Date | null
    setCurrency          // (currency: CurrencyCode) => void
  } = useCurrency();

  return (
    <div>
      <p>Current: {currentCurrency}</p>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Last Update: {lastUpdated?.toLocaleTimeString()}</p>
      <p>EUR Rate: {rates.EUR}</p>
    </div>
  );
}
```

## Use in Product Grid

```tsx
'use client';

import PriceDisplay from '@/src/components/PriceDisplay';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const products: Product[] = [
  { id: '1', name: 'Ruby', price: 2500, image: '/ruby.jpg' },
  { id: '2', name: 'Sapphire', price: 1800, image: '/sapphire.jpg' },
  { id: '3', name: 'Diamond', price: 5000, image: '/diamond.jpg' },
];

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id} className="p-4 border rounded-lg">
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
          <PriceDisplay 
            amount={product.price}
            fromCurrency="USD"
            size="md"
          />
        </div>
      ))}
    </div>
  );
}
```

## TypeScript: Currency Code Type

```tsx
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/src/currency/config';

// Type-safe currency operations
const handleCurrencyChange = (newCurrency: CurrencyCode) => {
  const currencyInfo = SUPPORTED_CURRENCIES[newCurrency];
  console.log(`Switched to ${currencyInfo.name}`);
};

// Iterate through all currencies
Object.entries(SUPPORTED_CURRENCIES).forEach(([code, info]) => {
  console.log(`${info.flag} ${code}: ${info.symbol}`);
});
```

## Offline Support & Caching

The system automatically:
- Caches exchange rates in localStorage with timestamp
- Falls back to cached rates if API fails
- Provides sensible default rates (last known good values)
- Shows "Last updated" time in currency switcher

```tsx
// Fetch rates manually if needed
import { CurrencyProvider } from '@/src/currency';

// Component automatically fetches on mount
// No manual fetch needed - it's handled by the provider
```

## Supported Currencies

- 🇺🇸 USD - US Dollar ($)
- 🇪🇺 EUR - Euro (€)
- 🇬🇧 GBP - British Pound (£)
- 🇨🇦 CAD - Canadian Dollar (C$)
- 🇦🇺 AUD - Australian Dollar (A$)
- 🇯🇵 JPY - Japanese Yen (¥)
- 🇮🇳 INR - Indian Rupee (₹)
- 🇦🇪 AED - UAE Dirham (د.إ)

## API Source

Using **exchangerate-api.com** free tier:
- Updates hourly
- No authentication required
- Fallback to cached rates
- Production-ready

Alternative APIs:
- fixer.io (better accuracy, requires API key)
- openexchangerates.org (historical data, paid)
- exchangerate.host (free alternative)
