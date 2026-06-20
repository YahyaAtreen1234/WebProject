'use client';

import { useState } from 'react';

interface CollectionFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
}

export interface FilterState {
  priceRange: [number, number];
  selectedCategories: string[];
  searchTerm: string;
  sortBy: string;
}

export default function CollectionFilters({ onFilterChange, categories }: CollectionFiltersProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handlePriceChange = (value: number, index: 0 | 1) => {
    const newRange = [...priceRange] as [number, number];
    newRange[index] = value;
    setPriceRange(newRange);
    onFilterChange({ priceRange: newRange, selectedCategories, searchTerm, sortBy });
  };

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    onFilterChange({ priceRange, selectedCategories: updated, searchTerm, sortBy });
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    onFilterChange({ priceRange, selectedCategories, searchTerm: term, sortBy });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onFilterChange({ priceRange, selectedCategories, searchTerm, sortBy: value });
  };

  const clearFilters = () => {
    setPriceRange([0, 500]);
    setSelectedCategories([]);
    setSearchTerm('');
    setSortBy('newest');
    onFilterChange({ priceRange: [0, 500], selectedCategories: [], searchTerm: '', sortBy: 'newest' });
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-bold text-white mb-4">Search</h3>
        <input
          type="text"
          placeholder="Search minerals..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-midnight-800/50 border border-sapphire-500/30 text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400"
        />
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-bold text-white mb-4">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-midnight-800/50 border border-sapphire-500/30 text-white focus:outline-none focus:border-sapphire-400"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-white mb-4">Price Range</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-midnight-300 block mb-2">Min: ${priceRange[0]}</label>
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(parseInt(e.target.value), 0)}
              className="w-full accent-sapphire-500"
            />
          </div>
          <div>
            <label className="text-sm text-midnight-300 block mb-2">Max: ${priceRange[1]}</label>
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(parseInt(e.target.value), 1)}
              className="w-full accent-sapphire-500"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-bold text-white mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-4 h-4 accent-sapphire-500 cursor-pointer"
              />
              <span className="text-sm text-midnight-200 hover:text-sapphire-300 transition-colors">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedCategories.length > 0 || searchTerm || priceRange[0] > 0 || priceRange[1] < 500) && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 rounded-lg bg-rose-600/20 border border-rose-500/50 text-rose-300 hover:bg-rose-600/30 transition-colors font-semibold"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
