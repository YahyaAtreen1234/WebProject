'use client';

import { useState, useMemo, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import CartUI from '@/components/Cart';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  image?: string;
  featured?: boolean;
}

interface FilterState {
  priceRange: [number, number];
  selectedCategories: string[];
  searchTerm: string;
  sortBy: string;
}

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    selectedCategories: [],
    searchTerm: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          console.log('[ShopPage] Products fetched:', data, 'Count:', data.length);

          if (!Array.isArray(data)) {
            console.error('[ShopPage] API returned non-array:', data);
            setAllProducts([]);
            setLoading(false);
            return;
          }

          // Set products first
          setAllProducts(data);
          console.log('[ShopPage] Products state updated with', data.length, 'products');

          // Calculate max price from products dynamically
          if (data.length > 0) {
            const maxPrice = Math.max(...data.map((p: Product) => p.price || 0));
            const bufferPrice = Math.ceil(maxPrice * 1.1); // Add 10% buffer
            console.log('[ShopPage] Max product price:', maxPrice, 'Setting filter max to:', bufferPrice);
            setFilters(prev => ({ ...prev, priceRange: [0, bufferPrice] }));
          }

          // Read URL search parameter AFTER products are fetched
          const searchParams = new URLSearchParams(window.location.search);
          const searchParam = searchParams.get('search');
          if (searchParam) {
            const decodedSearch = decodeURIComponent(searchParam);
            console.log('[ShopPage] Applying search filter from URL:', decodedSearch);
            setFilters(prev => ({ ...prev, searchTerm: decodedSearch }));
          }

          // Honour ?sort= from the navigation links (Best Sellers, New Arrivals,
          // On Sale) and from the homepage "View all featured" button.
          const sortParam = searchParams.get('sort');
          const allowedSorts = ['newest', 'featured', 'price-low', 'price-high', 'name-asc', 'name-desc'];
          if (sortParam && allowedSorts.includes(sortParam)) {
            console.log('[ShopPage] Applying sort from URL:', sortParam);
            setFilters(prev => ({ ...prev, sortBy: sortParam }));
          }

          // Clear loading state last
          setLoading(false);
        } else {
          console.error('[ShopPage] Failed to fetch products, status:', response.status);
          setAllProducts([]);
          setLoading(false);
        }
      } catch (error) {
        console.error('[ShopPage] Error fetching products:', error);
        setAllProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const { addItem } = useCart();

  // Get unique categories
  const categories = allProducts.length > 0 ? [...new Set(allProducts.map((p) => p.category))] : [];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    // Copy before sorting — sort() mutates, and with no filters applied `result`
    // would otherwise be the allProducts state array itself.
    let result = [...allProducts];

    // Search filter
    if (filters.searchTerm) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.selectedCategories.length > 0) {
      result = result.filter((p) => filters.selectedCategories.includes(p.category));
    }

    // Price filter
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

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
      case 'featured':
        // Featured first, otherwise keep the API's newest-first order.
        result.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
        break;
      default:
        // 'newest' — the API already returns createdAt desc, so leave it alone.
        break;
    }

    return result;
  }, [allProducts, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <section className="container-gutter section-spacing pt-gutter-lg">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl md:text-5xl">Our Collection</h1>
          <p className="text-lg md:text-xl text-midnight-200 leading-relaxed max-w-3xl">
            Carefully curated gemstones and minerals from around the world. Each piece is unique and selected for its exceptional beauty, rarity, and investment potential.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-sapphire-600 text-white'
                  : 'bg-midnight-800/50 border border-sapphire-500/30 text-midnight-200 hover:border-sapphire-400'
              }`}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-sapphire-600 text-white'
                  : 'bg-midnight-800/50 border border-sapphire-500/30 text-midnight-200 hover:border-sapphire-400'
              }`}
            >
              ≡ List
            </button>
          </div>

          <div className="flex gap-4">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-midnight-800/50 border border-sapphire-500/30 text-white text-sm focus:outline-none focus:border-sapphire-400"
            >
              <option value="6">6 per page</option>
              <option value="12">12 per page</option>
              <option value="24">24 per page</option>
            </select>

            <div className="text-sm text-midnight-300 px-4 py-2">
              Showing {paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
              {filteredProducts.length}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-gutter pb-gutter-lg">
          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-2xl font-bold text-white mb-2">Loading products...</h3>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
              <p className="text-midnight-300">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    // ProductCard adds to the cart itself via CartContext;
                    // passing onAddToCart as well would add each item twice.
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="card-glass backdrop-blur-md p-6 rounded-2xl flex gap-6 items-start"
                    >
                      <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-sapphire-900/50 to-amethyst-900/50 flex items-center justify-center text-4xl flex-shrink-0">
                        💎
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{product.title}</h3>
                            <p className="text-sm text-sapphire-300">{product.category}</p>
                          </div>
                          <p className="text-3xl font-bold bg-gradient-to-r from-gold-300 to-rose-300 bg-clip-text text-transparent">
                            ${product.price}
                          </p>
                        </div>

                        <p className="text-midnight-200 mb-4">{product.description}</p>

                        <div className="flex gap-4 items-center">
                          <span className="text-sm text-midnight-400">
                            Stock: <span className="text-white font-semibold">{product.stock}</span>
                          </span>
                          <button
                            onClick={() =>
                              addItem(
                                {
                                  id: product.id,
                                  name: product.title,
                                  price: product.price,
                                  image: product.image || '',
                                },
                                1
                              )
                            }
                            disabled={product.stock === 0}
                            className="px-6 py-2 btn-primary text-sm disabled:opacity-50"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-midnight-800/50 border border-sapphire-500/30 text-white hover:border-sapphire-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === page
                          ? 'bg-sapphire-600 text-white'
                          : 'bg-midnight-800/50 border border-sapphire-500/30 text-white hover:border-sapphire-400'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-midnight-800/50 border border-sapphire-500/30 text-white hover:border-sapphire-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
      </div>

      {/* Cart */}
      <CartUI />
    </div>
  );
}
