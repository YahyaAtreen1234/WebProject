'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredUserToken, notifyCompareChanged } from '@/lib/clientAuth';

interface CompareItem {
  id: string;
  productId: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  image?: string;
  category: string;
  description: string;
}

export default function ComparePage() {
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const [products, setProducts] = useState<{ [key: string]: Product }>({});
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const savedToken = getStoredUserToken();
    setToken(savedToken || '');
    if (savedToken) {
      fetchCompareList(savedToken);
    }
  }, []);

  const fetchCompareList = async (authToken: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/compare', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCompareList(data);
        fetchProductsData(data.map((item: any) => item.productId));
      }
    } catch (error) {
      console.error('Failed to fetch compare list:', error);
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
        data.forEach((p: Product) => {
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

  const removeFromCompare = async (compareItemId: string) => {
    try {
      const response = await fetch(`/api/compare/${compareItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setCompareList((prev) => prev.filter((item) => item.id !== compareItemId));
        notifyCompareChanged();
      }
    } catch (error) {
      console.error('Failed to remove from compare:', error);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-8">Product Comparison</h2>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Sign in to compare products</p>
            <Link
              href="/login"
              className="inline-block bg-black text-white font-bold px-6 py-3 rounded hover:bg-gray-800"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-black">Product Comparison</h2>
          <span className="text-gray-600">
            {compareList.length} item{compareList.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : compareList.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Your compare list is empty</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="p-4 text-left text-sm font-semibold text-black">
                    Product
                  </th>
                  {compareList.map((item) => {
                    const product = products[item.productId];
                    if (!product) return null;
                    return (
                      <th
                        key={item.id}
                        className="p-4 text-center text-sm font-semibold text-black min-w-[250px]"
                      >
                        <div className="mb-2">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-48 object-cover rounded mb-2"
                            />
                          )}
                        </div>
                        <p className="line-clamp-2">{product.title}</p>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="border-b border-gray-300">
                  <td className="p-4 font-semibold text-black">Price</td>
                  {compareList.map((item) => {
                    const product = products[item.productId];
                    if (!product) return null;
                    return (
                      <td key={item.id} className="p-4 text-center text-lg font-bold text-blue-600">
                        ${product.price.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>

                {/* Category Row */}
                <tr className="border-b border-gray-300 bg-gray-50">
                  <td className="p-4 font-semibold text-black">Category</td>
                  {compareList.map((item) => {
                    const product = products[item.productId];
                    if (!product) return null;
                    return (
                      <td key={item.id} className="p-4 text-center text-gray-700">
                        {product.category}
                      </td>
                    );
                  })}
                </tr>

                {/* Description Row */}
                <tr className="border-b border-gray-300">
                  <td className="p-4 font-semibold text-black">Description</td>
                  {compareList.map((item) => {
                    const product = products[item.productId];
                    if (!product) return null;
                    return (
                      <td key={item.id} className="p-4 text-center text-sm text-gray-600 line-clamp-3">
                        {product.description}
                      </td>
                    );
                  })}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="p-4"></td>
                  {compareList.map((item) => (
                    <td key={item.id} className="p-4 text-center">
                      <button
                        onClick={() => removeFromCompare(item.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
