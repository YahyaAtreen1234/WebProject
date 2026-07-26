'use client';

import { useState, useEffect } from 'react';
import { getStoredUserToken } from '@/lib/clientAuth';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image?: string;
  category: string;
}

interface ComparisonItem {
  id: string;
  productId: string;
}

export default function ProductComparison() {
  const [comparisonId, setComparisonId] = useState('');
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchComparison();
    fetchAllProducts();
  }, []);

  const fetchComparison = async () => {
    try {
      const sessionId = localStorage.getItem('comparison_session_id') || crypto.randomUUID();
      localStorage.setItem('comparison_session_id', sessionId);

      const response = await fetch('/api/comparisons', {
        headers: {
          'Authorization': `Bearer ${getStoredUserToken() || ''}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComparisonId(data.id);
        setItems(data.comparisonItems || []);
      }
    } catch (error) {
      console.error('Failed to fetch comparison:', error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const addToComparison = async (productId: string) => {
    if (!comparisonId) return;

    try {
      const response = await fetch(`/api/comparisons/${comparisonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        fetchComparison();
      }
    } catch (error) {
      console.error('Failed to add to comparison:', error);
    }
  };

  const removeFromComparison = async (productId: string) => {
    if (!comparisonId) return;

    try {
      await fetch(`/api/comparisons/${comparisonId}?productId=${productId}`, {
        method: 'DELETE',
      });
      fetchComparison();
    } catch (error) {
      console.error('Failed to remove from comparison:', error);
    }
  };

  const comparisonProductIds = items.map((item) => item.productId);
  const comparedProducts = allProducts.filter((p) =>
    comparisonProductIds.includes(p.id)
  );

  return (
    <div className="space-y-8">
      {/* Comparison Table */}
      {comparedProducts.length > 0 && (
        <div className="card-glass p-6 border border-sapphire-500/20">
          <h3 className="text-2xl font-bold text-white mb-6">
            Product Comparison ({comparedProducts.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sapphire-500/30">
                  <th className="px-4 py-3 text-left text-white font-semibold">
                    Product
                  </th>
                  {comparedProducts.map((p) => (
                    <th
                      key={p.id}
                      className="px-4 py-3 text-center text-white font-semibold"
                    >
                      {p.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-midnight-700">
                  <td className="px-4 py-3 text-midnight-300 font-semibold">Price</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-center text-sapphire-400 font-bold">
                      ${p.price.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-midnight-700">
                  <td className="px-4 py-3 text-midnight-300 font-semibold">Category</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-center text-white">
                      {p.category}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-midnight-300 font-semibold">Action</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeFromComparison(p.id)}
                        className="px-3 py-1 bg-rose-600 text-white rounded text-sm hover:bg-rose-700"
                      >
                        Remove
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Products Section */}
      <div className="card-glass p-6 border border-sapphire-500/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Add Products to Compare</h3>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-sapphire-400 hover:text-sapphire-300"
          >
            {showAll ? 'Hide' : 'Show All'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(showAll ? allProducts : allProducts.slice(0, 6)).map((product) => (
            <div
              key={product.id}
              className="bg-midnight-800/50 border border-midnight-700 rounded-lg p-4 hover:border-sapphire-500/50"
            >
              <h4 className="text-white font-semibold mb-2 truncate">{product.title}</h4>
              <p className="text-sapphire-400 font-bold mb-3">${product.price.toFixed(2)}</p>
              <button
                onClick={() =>
                  comparisonProductIds.includes(product.id)
                    ? removeFromComparison(product.id)
                    : addToComparison(product.id)
                }
                className={`w-full px-3 py-2 rounded text-sm font-semibold transition-all ${
                  comparisonProductIds.includes(product.id)
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-sapphire-600 text-white hover:bg-sapphire-700'
                }`}
              >
                {comparisonProductIds.includes(product.id)
                  ? '✓ In Comparison'
                  : '+ Add to Compare'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}