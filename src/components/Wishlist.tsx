'use client';

import { useState, useEffect } from 'react';

interface WishlistItem {
  id: string;
  productId: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  image?: string;
  category: string;
}

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<{ [key: string]: Product }>({});
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('user_token');
    setToken(savedToken || '');
    if (savedToken) {
      fetchWishlist(savedToken);
    }
  }, []);

  const fetchWishlist = async (authToken: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
        fetchProductsData(data.map((item) => item.productId));
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsData = async (productIds: string[]) => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        const productMap: { [key: string]: Product } = {};
        data.products.forEach((p: Product) => {
          if (productIds.includes(p.id)) {
            productMap[p.id] = p;
          }
        });
        setProducts(productMap);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setWishlist(wishlist.filter((item) => item.productId !== productId));
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const addToCart = (productId: string) => {
    const product = products[productId];
    if (product) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: any) => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ productId, quantity: 1, price: product.price });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Added to cart!');
    }
  };

  if (!token) {
    return (
      <div className="card-glass p-8 border border-sapphire-500/20 text-center">
        <p className="text-midnight-300 mb-4">Sign in to view your wishlist</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">My Wishlist</h2>
        <span className="text-midnight-300">
          {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-8 text-midnight-300">Loading...</div>
      ) : wishlist.length === 0 ? (
        <div className="card-glass p-8 border border-sapphire-500/20 text-center">
          <p className="text-midnight-300">Your wishlist is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => {
            const product = products[item.productId];
            if (!product) return null;

            return (
              <div
                key={item.id}
                className="card-glass p-4 border border-sapphire-500/20 hover:border-sapphire-500/50"
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}
                <h3 className="text-white font-semibold mb-2 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-sapphire-400 font-bold mb-4">
                  ${product.price.toFixed(2)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => addToCart(product.id)}
                    className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="px-3 py-2 bg-rose-600 text-white rounded text-sm hover:bg-rose-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}