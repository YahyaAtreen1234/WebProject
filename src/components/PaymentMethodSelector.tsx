'use client';

import { useState, useEffect } from 'react';

interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  cardholderName?: string;
  paypalEmail?: string;
  bankName?: string;
  isDefault: boolean;
}

interface PaymentMethodSelectorProps {
  onSelect: (methodId: string, type: string) => void;
  token: string;
}

export default function PaymentMethodSelector({
  onSelect,
  token,
}: PaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewMethod, setShowNewMethod] = useState(false);

  useEffect(() => {
    if (token) {
      fetchPaymentMethods();
    }
  }, [token]);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/payment-methods', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMethods(data);
        const defaultMethod = data.find((m: PaymentMethod) => m.isDefault);
        if (defaultMethod) {
          setSelectedId(defaultMethod.id);
          onSelect(defaultMethod.id, defaultMethod.type);
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (method: PaymentMethod) => {
    setSelectedId(method.id);
    onSelect(method.id, method.type);
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method.type) {
      case 'credit_card':
        return `Credit Card ending in ${method.last4} - ${method.cardholderName}`;
      case 'paypal':
        return `PayPal - ${method.paypalEmail}`;
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      case 'bank_transfer':
        return `${method.bankName} - ...${method.last4}`;
      default:
        return method.type;
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return '💳';
      case 'paypal':
        return '🅿️';
      case 'apple_pay':
        return '🍎';
      case 'google_pay':
        return '🔵';
      case 'bank_transfer':
        return '🏦';
      default:
        return '💰';
    }
  };

  if (loading) {
    return <div className="text-midnight-400">Loading payment methods...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Payment Method</h3>

      {methods.length > 0 && (
        <div className="space-y-3">
          {methods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedId === method.id
                  ? 'border-sapphire-500 bg-sapphire-500/10'
                  : 'border-midnight-700 bg-midnight-800 hover:border-midnight-600'
              }`}
            >
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={selectedId === method.id}
                onChange={() => handleSelect(method)}
                className="mr-3"
              />
              <span className="text-xl mr-3">{getMethodIcon(method.type)}</span>
              <span className="text-white flex-1">{getMethodLabel(method)}</span>
              {method.isDefault && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                  Default
                </span>
              )}
            </label>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowNewMethod(!showNewMethod)}
        className="w-full px-4 py-3 border-2 border-dashed border-sapphire-500/50 text-sapphire-400 rounded-lg hover:border-sapphire-500 hover:bg-sapphire-500/5 transition-all"
      >
        + Add New Payment Method
      </button>

      {showNewMethod && (
        <div className="bg-midnight-800 p-4 rounded-lg border border-midnight-700">
          <h4 className="text-white font-semibold mb-4">Select Payment Method Type</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 border border-midnight-600 rounded-lg hover:bg-midnight-700 text-white flex items-center justify-center">
              💳 Credit Card
            </button>
            <button className="p-3 border border-midnight-600 rounded-lg hover:bg-midnight-700 text-white flex items-center justify-center">
              🅿️ PayPal
            </button>
            <button className="p-3 border border-midnight-600 rounded-lg hover:bg-midnight-700 text-white flex items-center justify-center">
              🍎 Apple Pay
            </button>
            <button className="p-3 border border-midnight-600 rounded-lg hover:bg-midnight-700 text-white flex items-center justify-center">
              🔵 Google Pay
            </button>
            <button className="p-3 col-span-2 border border-midnight-600 rounded-lg hover:bg-midnight-700 text-white flex items-center justify-center">
              🏦 Bank Transfer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
