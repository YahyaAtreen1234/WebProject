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
      const response = await fetch('/api/products?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
      setTotalProducts(data.products?.length || 0);
      console.log('[GalleryPage] Products fetched:', data.products?.length);
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
        result.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
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
    <div className="min-h-screen bg-gradient-to-b from-midnight-950 via-midnight-900 to-midnight-950">
      {/* Header Section */}
      <div className="container-gutter py-gutter-lg">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gold-500 mb-4">Our Collection</h1>
          <p className="text-lg text-midnight-300 max-w-2xl">
            Carefully curated gemstones and minerals from around the world. Each piece is unique and selected for its
            exceptional beauty, rarity, and investment potential.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-12">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, viewMode: 'grid' }))}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filters.viewMode === 'grid'
                ? 'bg-gold-600 text-white'
                : 'bg-midnight-800 border border-sapphire-500/30 text-white hover:border-sapphire-400'
            }`}
          >
            🔳 Grid
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, viewMode: 'list' }))}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              filters.viewMode === 'list'
                ? 'bg-gold-600 text-white'
                : 'bg-midnight-800 border border-sapphire-500/30 text-white hover:border-sapphire-400'
            }`}
          >
            ≡ List
          </button>
        </div>
      </div>

      {/* Search & Filter Panel - Centered */}
      <div className="container-gutter max-w-4xl mx-auto mb-12">
        {/* Search Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Search</h2>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            <input
              type="text"
              placeholder="Search minerals, gems, stones..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-500 transition-colors"
            />
          </div>
        </div>

        {/* Sort Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Sort By</h2>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
            className="w-full px-4 py-3 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Filter by Category</h2>
          <div className="space-y-3">
            {visibleCategories.map((cat) => (
              <label key={cat} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.selectedCategories.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                  className="w-5 h-5 accent-sapphire-500 cursor-pointer"
                />
                <span className="ml-3 text-white group-hover:text-sapphire-400 transition-colors">{cat}</span>
              </label>
            ))}
            {FILTER_CATEGORIES.length > 6 && (
              <button
                onClick={() => setExpandedCategories(!expandedCategories)}
                className="text-sapphire-400 hover:text-sapphire-300 font-semibold mt-4"
              >
                {expandedCategories ? '← Show less' : 'View more...'}
              </button>
            )}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Price Range</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-midnight-400 mb-2 block">Min</label>
                <input
                  type="number"
                  min="0"
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceChange('min', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-midnight-400 mb-2 block">Max</label>
                <input
                  type="number"
                  max="10000"
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceChange('max', Math.min(10000, parseInt(e.target.value) || 10000))}
                  className="w-full px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-midnight-300">
              <span>${filters.priceRange.min.toLocaleString()}</span>
              <span>${filters.priceRange.max.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-12">
          <button
            onClick={() => applyFilters()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-700 text-white rounded-lg font-semibold hover:from-gold-700 hover:to-gold-800 transition-all"
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="flex-1 px-6 py-3 bg-midnight-800 border border-sapphire-500/30 text-white rounded-lg font-semibold hover:border-sapphire-400 transition-all"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="container-gutter">
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
            {/* Products Grid/List */}
            <div
              className={
                filters.viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'
                  : 'space-y-4 mb-12'
              }
            >
              {paginatedProducts.map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`}>
                  <div
                    className={`group cursor-pointer ${
                      filters.viewMode === 'list'
                        ? 'flex gap-4 p-4 bg-midnight-800/50 rounded-lg hover:bg-midnight-800 transition-all'
                        : 'flex flex-col h-full bg-midnight-800/50 rounded-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105'
                    }`}
                  >
                    {/* Image */}
                    <div
                      className={`relative bg-gradient-to-br from-midnight-700 to-midnight-900 ${
                        filters.viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'w-full h-48'
                      }`}
                    >
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
                    <div className={`${filters.viewMode === 'grid' ? 'flex-1 p-4' : 'flex-1 flex flex-col justify-between'}`}>
                      <div>
                        <p className="text-xs text-sapphire-400 mb-1">{product.category}</p>
                        <h3 className="text-white font-semibold group-hover:text-gold-400 transition-colors">
                          {product.title}
                        </h3>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gold-500 font-bold">${product.price.toFixed(2)}</span>
                        <span className="text-xs text-midnight-400">
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
