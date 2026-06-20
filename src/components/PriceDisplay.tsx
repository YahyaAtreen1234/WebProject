'use client';

import { useFormatPrice, useCurrencyInfo } from '@/src/currency/useCurrency';
import { CurrencyCode } from '@/src/currency/config';

interface PriceDisplayProps {
  amount: number;
  fromCurrency?: CurrencyCode;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function PriceDisplay({
  amount,
  fromCurrency = 'USD',
  size = 'md',
  showLabel = true,
  className = '',
}: PriceDisplayProps) {
  const formatPrice = useFormatPrice();
  const currencyInfo = useCurrencyInfo();

  const formattedPrice = formatPrice(amount, fromCurrency);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`${sizeClasses[size]} font-bold text-emerald-400`}>
        {formattedPrice}
      </span>
      {showLabel && (
        <span className="text-xs text-midnight-400 hidden sm:inline">
          {currencyInfo.code}
        </span>
      )}
    </div>
  );
}

// Variation: Display with original price for reference
export function PriceDisplayWithOriginal({
  amount,
  fromCurrency = 'USD',
  size = 'md',
  showConversion = true,
}: Omit<PriceDisplayProps, 'showLabel'> & { showConversion?: boolean }) {
  const formatPrice = useFormatPrice();
  const currencyInfo = useCurrencyInfo();

  const formattedPrice = formatPrice(amount, fromCurrency);
  const originalPrice = `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="space-y-1">
      <div className={`${sizeClasses[size]} font-bold text-emerald-400`}>
        {formattedPrice}
      </div>
      {showConversion && (
        <div className="text-xs text-midnight-400">
          <span className="line-through text-midnight-500">{originalPrice}</span>
          <span className="ml-2">({currencyInfo.code})</span>
        </div>
      )}
    </div>
  );
}
