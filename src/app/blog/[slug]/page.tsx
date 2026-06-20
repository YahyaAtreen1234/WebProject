'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import BlogCard from '@/src/components/blog/BlogCard';
import { blogPosts } from '@/src/data/blogData';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!post) {
    return (
      <main className="w-full min-h-screen bg-midnight-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
          <p className="text-midnight-400 mb-8">
            The article you're looking for doesn't exist.
          </p>
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-sapphire-500 text-white rounded-lg font-semibold hover:bg-sapphire-600 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  // Get related posts
  const relatedPosts = blogPosts
    .filter((p) => post.relatedPostIds.includes(p.id) && p.status === 'published')
    .slice(0, 3);

  const formattedDate = new Date(post.publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const updatedDate = new Date(post.updatedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Guides: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      News: 'bg-green-500/20 text-green-400 border-green-500/50',
      Education: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      Trends: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    };
    return colors[category] || 'bg-sapphire-500/20 text-sapphire-400';
  };

  return (
    <main className="w-full bg-midnight-950">
      {/* Featured Image Section */}
      <section className="w-full h-96 sm:h-[500px] bg-gradient-to-br from-sapphire-500/20 to-amethyst-500/20 relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-50">
          📸
        </div>

        {/* Overlay Content */}
        <div
          className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 transform ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="mb-4 inline-block">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${getCategoryColor(
                post.category
              )}`}
            >
              {post.category}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {post.title}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-midnight-300">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{post.readTime} min read</span>
            <span>•</span>
            <span>{post.stats.views.toLocaleString()} views</span>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-midnight-950">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-midnight-400">
            <Link href="/blog" className="hover:text-sapphire-400 transition-colors">
              Blog
            </Link>
            <span>•</span>
            <Link
              href={`/blog?category=${post.category}`}
              className="hover:text-sapphire-400 transition-colors"
            >
              {post.category}
            </Link>
            <span>•</span>
            <span className="text-sapphire-400">{post.title.substring(0, 30)}...</span>
          </div>

          {/* Author Info */}
          <div className="mb-8 pb-8 border-b border-midnight-700 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sapphire-500 to-amethyst-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <p className="text-white font-semibold">{post.author.name}</p>
              <p className="text-sm text-midnight-400">{post.author.bio}</p>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-lg leading-relaxed text-midnight-300 mb-6">
              {post.excerpt}
            </p>
            <div
              className="text-base leading-relaxed text-midnight-300 space-y-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="py-8 border-t border-midnight-700">
              <p className="text-sm font-semibold text-midnight-300 mb-4">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?search=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded-full bg-sapphire-500/10 border border-sapphire-500/30 text-sapphire-400 text-sm hover:border-sapphire-500/60 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Social Share & Metadata */}
          <div className="py-8 border-t border-midnight-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-midnight-500">
              Last updated: {updatedDate}
            </div>
            <div className="flex gap-3">
              <button
                title="Share on Twitter"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      post.seoMetadata.canonicalUrl
                    )}&text=${encodeURIComponent(post.title)}`,
                    '_blank'
                  )
                }
                className="p-2 rounded-lg bg-sapphire-500/10 hover:bg-sapphire-500/20 text-sapphire-400 transition-colors"
              >
                𝕏
              </button>
              <button
                title="Share on LinkedIn"
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      post.seoMetadata.canonicalUrl
                    )}`,
                    '_blank'
                  )
                }
                className="p-2 rounded-lg bg-sapphire-500/10 hover:bg-sapphire-500/20 text-sapphire-400 transition-colors"
              >
                💼
              </button>
              <button
                title="Copy link"
                onClick={() => {
                  navigator.clipboard.writeText(post.seoMetadata.canonicalUrl);
                  alert('Link copied!');
                }}
                className="p-2 rounded-lg bg-sapphire-500/10 hover:bg-sapphire-500/20 text-sapphire-400 transition-colors"
              >
                🔗
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-midnight-900 border-t border-sapphire-500/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-midnight-950 border-t border-sapphire-500/10">
        <div className="max-w-6xl mx-auto text-center">
          <Link
            href="/blog"
            className="inline-block px-8 py-3 bg-sapphire-500 hover:bg-sapphire-600 text-white rounded-lg font-semibold transition-colors"
          >
            ← Back to All Articles
          </Link>
        </div>
      </section>
    </main>
  );
}
