'use client';

import { useState } from 'react';
import { getStoredUserToken, notifyWishlistChanged } from '@/lib/clientAuth';

interface WishlistButtonProps {
  productId: string;
  onAdded?: () => void;
}

export default function WishlistButton({ productId, onAdded }: WishlistButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToWishlist = async () => {
    setLoading(true);
    try {
      const token = getStoredUserToken();

      if (!token) {
        alert('Please sign in to use wishlist');
        return;
      }

      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setIsFavorite(true);
        notifyWishlistChanged();
        onAdded?.();
      } else if (response.status === 409) {
        setIsFavorite(true);
        alert('Product already in wishlist');
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      alert('Failed to add to wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToWishlist}
      disabled={loading}
      className={`text-2xl hover:scale-110 transition-transform ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title="Add to Wishlist"
    >
      {isFavorite ? '❤️' : '🤍'}
    </button>
  );
}
