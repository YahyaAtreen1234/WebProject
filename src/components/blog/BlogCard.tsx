'use client';

import Link from 'next/link';
import { BlogPost } from '@/data/blogData';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Guides: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      News: 'bg-green-500/20 text-green-400 border-green-500/50',
      Education: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      Trends: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    };
    return colors[category] || 'bg-sapphire-500/20 text-sapphire-400';
  };

  const formattedDate = new Date(post.publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group h-full rounded-xl overflow-hidden bg-midnight-800 border border-sapphire-500/20 hover:border-sapphire-500/50 transition-all hover:shadow-lg hover:shadow-sapphire-500/20 hover:-translate-y-1 cursor-pointer">
        {/* Image Container */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-midnight-700">
          <div className="w-full h-full bg-gradient-to-br from-sapphire-500/20 to-amethyst-500/20 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
            📸
          </div>

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                post.category
              )}`}
            >
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col h-full">
          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-sapphire-400 transition-colors">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm sm:text-base text-midnight-400 mb-4 line-clamp-2 flex-grow">
            {post.excerpt}
          </p>

          {/* Meta Info */}
          <div className="space-y-3 pt-4 border-t border-midnight-700">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sapphire-500 to-amethyst-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                {post.author.name.charAt(0)}
              </div>
              <div className="text-xs sm:text-sm">
                <p className="text-white font-semibold truncate">
                  {post.author.name}
                </p>
                <p className="text-midnight-500">
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* Read Time */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-midnight-400">
              <span>📖</span>
              <span>{post.readTime} min read</span>
              <span>•</span>
              <span>{post.stats.views.toLocaleString()} views</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
