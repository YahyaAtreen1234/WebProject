'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  image: string;
  images: string;
  featured: boolean;
  stock: number;
  description: string;
  createdAt: string;
}

interface FilterState {
  searchTerm: string;
  selectedCategories: string[];
  priceRange: { min: number; max: number };
  sortBy: string;
  viewMode: 'grid' | 'list';
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'name-desc', label: 'Name: Z-A' },
];

const FILTER_CATEGORIES = [
  'Amethyst',
  'Rose Quartz',
  'Citrine',
  'Clear Quartz',
  'Tourmaline',
  'Garnet',
  'Jade',
  'Opal',
  'Aquamarine',
  'Emerald',
];

export default function GalleryPage() {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedCategories: [],
    priceRange: { min: 0, max: 10000 },
    sortBy: 'newest',
    viewMode: 'grid',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState(false);

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      const productsList = Array.isArray(data) ? data : (data.products || []);
      setProducts(productsList);
      setTotalProducts(productsList.length);
      console.log('[GalleryPage] Products fetched:', productsList.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading products');
      console.error('[GalleryPage] Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    console.log('[GalleryPage] Filters applied:', filters);
    let result = products;

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
      console.log('[GalleryPage] Search: "' + filters.searchTerm + '" → ' + result.length + ' results');
    }

    // Category filter
    if (filters.selectedCategories.length > 0) {
      result = result.filter((p) => filters.selectedCategories.includes(p.category));
      console.log('[GalleryPage] Category filter applied');
    }

    // Price filter
    result = result.filter((p) => p.price >= filters.priceRange.min && p.price <= filters.priceRange.max);

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredProducts(result);
    setPage(1);
    console.log('[GalleryPage] Sort: ' + filters.sortBy + ' → ' + result.length + ' products');
  }, [products, filters]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter((c) => c !== category)
        : [...prev.selectedCategories, category],
    }));
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: { ...prev.priceRange, [type]: value },
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      selectedCategories: [],
      priceRange: { min: 0, max: 10000 },
      sortBy: 'newest',
      viewMode: 'grid',
    });
    setPage(1);
    console.log('[GalleryPage] Filters reset');
  };

  const visibleCategories = expandedCategories ? FILTER_CATEGORIES : FILTER_CATEGORIES.slice(0, 6);
  const start = (page - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(page * ITEMS_PER_PAGE, filteredProducts.length);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="container-gutter py-12 px-4 sm:px-6">
        <h1 className="text-4xl font-bold text-black mb-4">Gallery</h1>
        <p className="text-gray-600">Browse our collection of gemstones and minerals</p>
      </div>

      {/* Results Section */}
      <div className="container-gutter px-4 sm:px-6">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg mb-8">
            <p className="text-rose-400">{error}</p>
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <p className="text-midnight-300">
            Showing {start} - {end} of {filteredProducts.length} products
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-midnight-300">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-midnight-300 text-lg">No products found matching your filters</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {paginatedProducts.map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`}>
                  <div className="group cursor-pointer flex flex-col h-full bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-105 border border-gray-200">
                    {/* Image */}
                    <div className="relative bg-gray-100 w-full h-48">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">💎</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                      <h3 className="text-black font-semibold group-hover:text-gray-700 transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-lg font-bold text-black">${product.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mb-12">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 text-white rounded-lg hover:border-sapphire-400 disabled:opacity-50 transition-all"
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      page === p
                        ? 'bg-gold-600 text-white'
                        : 'bg-midnight-800 border border-sapphire-500/30 text-white hover:border-sapphire-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 text-white rounded-lg hover:border-sapphire-400 disabled:opacity-50 transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
