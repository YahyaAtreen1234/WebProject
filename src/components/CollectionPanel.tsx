'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
  description: string;
  color: string;
  type: string;
  weight: string;
  origin: string;
  inWishlist: boolean;
}

interface Filter {
  type: string;
  value: string;
  label: string;
}

export default function CollectionPanel() {
  const { addItem: addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          const formattedProducts = data.map((product: any) => ({
            id: product.id,
            name: product.title,
            category: product.category.toLowerCase(),
            price: product.price,
            rating: 4.5,
            reviews: 0,
            image: product.image,
            stock: product.stock,
            description: product.description,
            color: 'Multi',
            type: 'Gemstone',
            weight: '0g',
            origin: 'Unknown',
            inWishlist: false,
          }));
          setAllProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['All', 'Crystals', 'Geodes', 'Minerals', 'Tumbled', 'Jewelry', 'Slices'];
  const filterOptions = {
    color: ['Purple', 'Pink', 'Clear', 'Black', 'Yellow', 'Green', 'Blue', 'White', 'Multi', 'Brown'],
    type: ['Cluster', 'Point', 'Raw', 'Geode', 'Tumbled', 'Sphere', 'Carved', 'Slice', 'Bracelet'],
    price: ['Under $25', '$25-$50', '$50-$100', '$100-$200', 'Over $200'],
    origin: ['Brazil', 'Madagascar', 'USA', 'India', 'Afghanistan', 'Sri Lanka', 'Peru', 'China', 'South Africa'],
  };

  // Filter and sort products
  let filteredProducts = allProducts
    .filter((product) => {
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      for (const filter of activeFilters) {
        if (filter.type === 'category' && product.category !== filter.value.toLowerCase()) {
          return false;
        }
        if (filter.type === 'color' && product.color !== filter.value) {
          return false;
        }
        if (filter.type === 'type' && product.type !== filter.value) {
          return false;
        }
        if (filter.type === 'origin' && product.origin !== filter.value) {
          return false;
        }
      }

      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return b.reviews - a.reviews;
        case 'newest':
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFilter = (type: string, value: string, label: string) => {
    const filterKey = `${type}-${value}`;
    setActiveFilters((prev) => {
      const exists = prev.some((f) => f.type === type && f.value === value);
      if (exists) {
        return prev.filter((f) => !(f.type === type && f.value === value));
      } else {
        return [...prev, { type, value, label }];
      }
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setSearchTerm('');
    setPriceRange([0, 5000]);
    setCurrentPage(1);
  };

  const isFilterActive = (type: string, value: string) => {
    return activeFilters.some((f) => f.type === type && f.value === value);
  };

  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-white mb-3">Collections</h1>
          <p className="text-midnight-400">
            Explore our curated selection of natural gemstones and minerals
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search gemstones, minerals, crystals..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-6 py-3 pl-12 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-500 focus:outline-none transition-colors"
            />
            <span className="absolute left-4 top-3 text-xl">🔍</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="card-glass p-6 border border-sapphire-500/20 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Filters</h2>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sapphire-400 hover:text-sapphire-300 text-sm font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Active Filters Display */}
              {activeFilters.length > 0 && (
                <div className="mb-6 pb-6 border-b border-midnight-700">
                  <p className="text-midnight-400 text-sm mb-2">Active Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          toggleFilter(filter.type, filter.value, filter.label)
                        }
                        className="px-3 py-1 bg-sapphire-600 text-white rounded-full text-xs font-semibold hover:bg-sapphire-700 transition-colors flex items-center gap-2"
                      >
                        {filter.label}
                        <span>✕</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="mb-6 pb-6 border-b border-midnight-700">
                <h3 className="text-white font-semibold mb-3">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange[0]}
                    onChange={(e) => {
                      setPriceRange([Number(e.target.value), priceRange[1]]);
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange[1]}
                    onChange={(e) => {
                      setPriceRange([priceRange[0], Number(e.target.value)]);
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-midnight-300 text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6 pb-6 border-b border-midnight-700">
                <h3 className="text-white font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.slice(1).map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-3 cursor-pointer p-2 hover:bg-midnight-800/50 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isFilterActive('category', cat.toLowerCase())}
                        onChange={() => toggleFilter('category', cat.toLowerCase(), cat)}
                        className="w-4 h-4"
                      />
                      <span className="text-midnight-300">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="mb-6 pb-6 border-b border-midnight-700">
                <h3 className="text-white font-semibold mb-3">Color</h3>
                <div className="space-y-2">
                  {filterOptions.color.map((color) => (
                    <label
                      key={color}
                      className="flex items-center gap-3 cursor-pointer p-2 hover:bg-midnight-800/50 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isFilterActive('color', color)}
                        onChange={() => toggleFilter('color', color, color)}
                        className="w-4 h-4"
                      />
                      <span className="text-midnight-300">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div className="mb-6 pb-6 border-b border-midnight-700">
                <h3 className="text-white font-semibold mb-3">Type</h3>
                <div className="space-y-2">
                  {filterOptions.type.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 cursor-pointer p-2 hover:bg-midnight-800/50 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isFilterActive('type', type)}
                        onChange={() => toggleFilter('type', type, type)}
                        className="w-4 h-4"
                      />
                      <span className="text-midnight-300">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Origin Filter */}
              <div>
                <h3 className="text-white font-semibold mb-3">Origin</h3>
                <div className="space-y-2">
                  {filterOptions.origin.slice(0, 5).map((origin) => (
                    <label
                      key={origin}
                      className="flex items-center gap-3 cursor-pointer p-2 hover:bg-midnight-800/50 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isFilterActive('origin', origin)}
                        onChange={() => toggleFilter('origin', origin, origin)}
                        className="w-4 h-4"
                      />
                      <span className="text-midnight-300">{origin}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="card-glass p-4 border border-sapphire-500/20 mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 transition-all"
                >
                  🔍 Filters
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-midnight-800 border border-midnight-700 rounded-lg text-white focus:border-sapphire-500 focus:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-sapphire-600 text-white'
                      : 'bg-midnight-800 text-midnight-400 hover:text-white'
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-sapphire-600 text-white'
                      : 'bg-midnight-800 text-midnight-400 hover:text-white'
                  }`}
                >
                  ≡
                </button>
                <span className="text-midnight-400 text-sm">
                  {filteredProducts.length} results
                </span>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-2xl font-bold text-white mb-2">Loading products...</h3>
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'
                    : 'space-y-4 mb-8'
                }
              >
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`card-glass border border-sapphire-500/20 hover:border-sapphire-500/40 transition-all group cursor-pointer overflow-hidden ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Product Image */}
                    <div
                      className={`${
                        viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'w-full h-48'
                      } bg-gradient-to-br from-sapphire-600/20 to-amethyst-600/20 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform`}
                    >
                      {product.image}
                    </div>

                    {/* Product Info */}
                    <div className={`${viewMode === 'list' ? 'flex-1' : 'w-full'} p-4`}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-white group-hover:text-sapphire-300 transition-colors">
                          {product.name}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle wishlist
                          }}
                          className="text-xl hover:scale-125 transition-transform"
                        >
                          {product.inWishlist ? '❤️' : '🤍'}
                        </button>
                      </div>

                      <p className="text-midnight-400 text-sm mb-2">{product.category}</p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-400">★</span>
                        <span className="text-white font-semibold">{product.rating}</span>
                        <span className="text-midnight-400 text-sm">({product.reviews})</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sapphire-400 font-bold text-lg">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-midnight-400 line-through text-sm">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mb-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            product.stock > 10
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : product.stock > 0
                              ? 'bg-gold-500/20 text-gold-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>

                      {/* Add to Cart */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            color: product.color,
                            weight: product.weight,
                            origin: product.origin,
                          }, 1);
                          setToast({ message: `✅ ${product.name} added to cart!`, show: true });
                          setTimeout(() => setToast({ message: '', show: false }), 3000);
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg hover:from-sapphire-700 hover:to-sapphire-800 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={product.stock === 0}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 card-glass border border-midnight-700 rounded-lg">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-midnight-400">No products found matching your filters</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-midnight-800 text-white rounded-lg hover:bg-midnight-700 transition-all disabled:opacity-50"
                >
                  ← Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-all ${
                        currentPage === page
                          ? 'bg-sapphire-600 text-white'
                          : 'bg-midnight-800 text-midnight-400 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-midnight-800 text-white rounded-lg hover:bg-midnight-700 transition-all disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            )}

            {/* Items Per Page */}
            <div className="flex items-center justify-center gap-4">
              <label className="text-midnight-400">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-midnight-800 border border-midnight-700 rounded-lg text-white focus:border-sapphire-500 focus:outline-none"
              >
                <option value="6">6</option>
                <option value="12">12</option>
                <option value="24">24</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="card-glass border border-sapphire-500/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-2xl text-midnight-400 hover:text-white"
              >
                ✕
              </button>

              <div className="p-8">
                {/* Header */}
                <div className="flex items-start gap-8 mb-8">
                  <div className="w-48 h-48 bg-gradient-to-br from-sapphire-600/20 to-amethyst-600/20 rounded-lg flex items-center justify-center text-8xl">
                    {selectedProduct.image}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedProduct.name}</h2>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="text-white">{selectedProduct.rating}</span>
                      <span className="text-midnight-400">({selectedProduct.reviews} reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-sapphire-400">${selectedProduct.price}</span>
                        {selectedProduct.originalPrice && (
                          <span className="text-xl text-midnight-400 line-through">
                            ${selectedProduct.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock */}
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        selectedProduct.stock > 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="mb-8 pb-8 border-b border-midnight-700">
                  <h3 className="text-xl font-bold text-white mb-4">Product Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-midnight-400 text-sm">Description</p>
                      <p className="text-white mt-1">{selectedProduct.description}</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-midnight-400 text-sm">Color</p>
                        <p className="text-white font-semibold">{selectedProduct.color}</p>
                      </div>
                      <div>
                        <p className="text-midnight-400 text-sm">Type</p>
                        <p className="text-white font-semibold">{selectedProduct.type}</p>
                      </div>
                      <div>
                        <p className="text-midnight-400 text-sm">Weight</p>
                        <p className="text-white font-semibold">{selectedProduct.weight}</p>
                      </div>
                      <div>
                        <p className="text-midnight-400 text-sm">Origin</p>
                        <p className="text-white font-semibold">{selectedProduct.origin}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      addToCart({
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        price: selectedProduct.price,
                        image: selectedProduct.image,
                        color: selectedProduct.color,
                        weight: selectedProduct.weight,
                        origin: selectedProduct.origin,
                      }, 1);
                      setToast({ message: `✅ ${selectedProduct.name} added to cart!`, show: true });
                      setTimeout(() => setToast({ message: '', show: false }), 3000);
                    }}
                    disabled={selectedProduct.stock === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg hover:from-sapphire-700 hover:to-sapphire-800 transition-all font-semibold disabled:opacity-50"
                  >
                    🛒 Add to Cart
                  </button>
                  <button className="flex-1 px-6 py-3 border-2 border-sapphire-600 text-sapphire-400 rounded-lg hover:bg-sapphire-600/20 transition-all font-semibold">
                    ❤️ Add to Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed bottom-6 right-6 px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-lg z-50 animate-fadeInUp">
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
