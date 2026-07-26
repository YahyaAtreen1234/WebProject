'use client';

import { useState } from 'react';
import { getStoredUserToken, notifyCompareChanged } from '@/lib/clientAuth';

interface CompareProps {
  productId: string;
  onAdded?: () => void;
}

export default function Compare({ productId, onAdded }: CompareProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCompare = async () => {
    setLoading(true);
    try {
      const token = getStoredUserToken();

      if (!token) {
        alert('Please sign in to use compare');
        return;
      }

      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setIsAdded(true);
        notifyCompareChanged();
        onAdded?.();
        setTimeout(() => setIsAdded(false), 2000);
      } else if (response.status === 409) {
        alert('Product already in compare list');
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Failed to add to compare');
      }
    } catch (error) {
      console.error('Failed to add to compare:', error);
      alert('Failed to add to compare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCompare}
      disabled={loading}
      className={`text-xl hover:scale-110 transition-transform ${
        isAdded ? 'text-green-500' : ''
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Add to Compare"
    >
      {isAdded ? '✓' : '⟷'}
    </button>
  );
}
