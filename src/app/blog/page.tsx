'use client';

import { useState, useMemo } from 'react';
import type { Metadata } from 'next';
import BlogCard from '@/components/blog/BlogCard';
import { blogPosts, categories } from '@/data/blogData';

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(post.category);

      return matchesSearch && matchesCategory && post.status === 'published';
    });
  }, [searchTerm, selectedCategories]);

  // Paginate
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <main className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-midnight-900 via-midnight-950 to-midnight-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sapphire-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amethyst-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Blog & Insights
          </h1>
          <p className="text-lg sm:text-xl text-midnight-300 mb-8">
            Explore guides, news, and expert insights about gemstones and minerals.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-midnight-900/50 border-b border-sapphire-500/20">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-midnight-800 border border-sapphire-500/30 text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500/80 transition-colors text-base sm:text-lg"
            />
          </div>

          {/* Category Filters */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-midnight-300">Filter by Category</p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => toggleCategory(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    selectedCategories.includes(category.name)
                      ? category.color
                      : 'bg-midnight-800 border-midnight-700 text-midnight-400 hover:border-midnight-600'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Info */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-midnight-900 border-b border-sapphire-500/10">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm sm:text-base text-midnight-400">
            Showing {startIndex + 1}-{Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} of{' '}
            {filteredPosts.length} articles
            {selectedCategories.length > 0 && ` in ${selectedCategories.join(', ')}`}
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-midnight-950">
        <div className="max-w-6xl mx-auto">
          {paginatedPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
                {paginatedPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-sapphire-500/30 text-sapphire-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-sapphire-500/60 transition-colors text-sm sm:text-base"
                  >
                    ← Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                          currentPage === i + 1
                            ? 'bg-sapphire-500 text-white'
                            : 'border border-sapphire-500/30 text-sapphire-400 hover:border-sapphire-500/60'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-sapphire-500/30 text-sapphire-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-sapphire-500/60 transition-colors text-sm sm:text-base"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-midnight-400 mb-4">No articles found</p>
              <p className="text-sm text-midnight-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
