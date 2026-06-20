// Blog Data Structure and Sample Articles

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  postCount: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'Guides' | 'News' | 'Education' | 'Trends';
  author: Author;
  featuredImage: {
    url: string;
    alt: string;
    caption?: string;
  };
  publishedDate: string;
  updatedDate: string;
  readTime: number;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  seoMetadata: {
    metaDescription: string;
    metaKeywords: string;
    ogTitle: string;
    ogDescription: string;
    canonicalUrl: string;
  };
  stats: {
    views: number;
    shares: number;
    comments: number;
  };
  relatedPostIds: string[];
}

export const authors: Author[] = [
  {
    id: 'author-001',
    name: 'Sarah Mitchell',
    email: 'sarah@mineralgallery.com',
    avatar: '/avatars/sarah.jpg',
    bio: 'Gemology expert with 12+ years in the industry',
    social: {
      twitter: 'https://twitter.com/sarahmitchell',
      linkedin: 'https://linkedin.com/in/sarahmitchell',
    },
    postCount: 8,
  },
  {
    id: 'author-002',
    name: 'Marcus Chen',
    email: 'marcus@mineralgallery.com',
    avatar: '/avatars/marcus.jpg',
    bio: 'Chief Gemologist and mineral collector',
    social: {
      linkedin: 'https://linkedin.com/in/marcuschen',
    },
    postCount: 6,
  },
  {
    id: 'author-003',
    name: 'Elena Rodriguez',
    email: 'elena@mineralgallery.com',
    avatar: '/avatars/elena.jpg',
    bio: 'Sustainability advocate and sourcing specialist',
    social: {
      twitter: 'https://twitter.com/elenarod',
      linkedin: 'https://linkedin.com/in/elenarod',
    },
    postCount: 5,
  },
  {
    id: 'author-004',
    name: 'David Kumar',
    email: 'david@mineralgallery.com',
    avatar: '/avatars/david.jpg',
    bio: 'Technology enthusiast and platform developer',
    social: {
      github: 'https://github.com/davidkumar',
    },
    postCount: 4,
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: 'post-001',
    title: 'The Complete Guide to Gemstone Authentication',
    slug: 'complete-guide-gemstone-authentication',
    excerpt: 'Learn how to identify authentic gemstones using professional grading techniques and modern verification methods.',
    content: '<p>Full article content about gemstone authentication...</p>',
    category: 'Guides',
    author: authors[0],
    featuredImage: {
      url: '/blog/gemstone-auth.jpg',
      alt: 'Gemstone authentication under magnification',
      caption: 'Professional gemstone grading setup',
    },
    publishedDate: '2024-01-15T10:30:00Z',
    updatedDate: '2024-01-20T14:45:00Z',
    readTime: 8,
    status: 'published',
    tags: ['gemstones', 'authentication', 'grading', 'education'],
    seoMetadata: {
      metaDescription: 'Learn professional gemstone authentication techniques and verification methods.',
      metaKeywords: 'gemstone authentication, grading, certification, identification',
      ogTitle: 'The Complete Guide to Gemstone Authentication',
      ogDescription: 'Professional guide to authenticating gemstones with proven techniques',
      canonicalUrl: 'https://mineralgallery.com/blog/complete-guide-gemstone-authentication',
    },
    stats: {
      views: 3245,
      shares: 156,
      comments: 24,
    },
    relatedPostIds: ['post-003', 'post-005', 'post-008'],
  },
  {
    id: 'post-002',
    title: 'New Collection Launch: Rare Brazilian Agates',
    slug: 'new-collection-rare-brazilian-agates',
    excerpt: 'Introducing our exclusive collection of rare Brazilian agates sourced directly from ethical suppliers.',
    content: '<p>Full article about the new agate collection...</p>',
    category: 'News',
    author: authors[1],
    featuredImage: {
      url: '/blog/brazilian-agates.jpg',
      alt: 'Rare Brazilian agate collection',
      caption: 'Exclusive Brazilian agates now available',
    },
    publishedDate: '2024-01-12T15:20:00Z',
    updatedDate: '2024-01-12T15:20:00Z',
    readTime: 4,
    status: 'published',
    tags: ['new-collection', 'agates', 'brazilian', 'announcement'],
    seoMetadata: {
      metaDescription: 'Explore our new exclusive collection of rare Brazilian agates.',
      metaKeywords: 'Brazilian agates, rare collection, gemstones, exclusive',
      ogTitle: 'New Collection: Rare Brazilian Agates',
      ogDescription: 'Introducing our exclusive Brazilian agate collection',
      canonicalUrl: 'https://mineralgallery.com/blog/new-collection-rare-brazilian-agates',
    },
    stats: {
      views: 1890,
      shares: 87,
      comments: 12,
    },
    relatedPostIds: ['post-004', 'post-006'],
  },
  {
    id: 'post-003',
    title: 'Understanding Mineral Classifications and Properties',
    slug: 'understanding-mineral-classifications-properties',
    excerpt: 'A deep dive into how minerals are classified and what determines their unique physical properties.',
    content: '<p>Full article about mineral classifications...</p>',
    category: 'Education',
    author: authors[0],
    featuredImage: {
      url: '/blog/mineral-classes.jpg',
      alt: 'Various mineral classifications displayed',
      caption: 'Mineral classification chart',
    },
    publishedDate: '2024-01-10T09:15:00Z',
    updatedDate: '2024-01-10T09:15:00Z',
    readTime: 6,
    status: 'published',
    tags: ['minerals', 'classification', 'education', 'properties'],
    seoMetadata: {
      metaDescription: 'Learn about mineral classifications and their physical properties.',
      metaKeywords: 'minerals, classification, properties, crystal systems',
      ogTitle: 'Understanding Mineral Classifications and Properties',
      ogDescription: 'Educational guide to mineral classifications and properties',
      canonicalUrl: 'https://mineralgallery.com/blog/understanding-mineral-classifications-properties',
    },
    stats: {
      views: 2156,
      shares: 98,
      comments: 18,
    },
    relatedPostIds: ['post-001', 'post-007'],
  },
  {
    id: 'post-004',
    title: 'Gemstone Investment Trends 2024',
    slug: 'gemstone-investment-trends-2024',
    excerpt: 'Analyzing emerging trends in gemstone collecting and investment for 2024 and beyond.',
    content: '<p>Full article about investment trends...</p>',
    category: 'Trends',
    author: authors[2],
    featuredImage: {
      url: '/blog/investment-trends.jpg',
      alt: 'Investment trend analysis chart',
      caption: '2024 Gemstone Investment Outlook',
    },
    publishedDate: '2024-01-08T11:00:00Z',
    updatedDate: '2024-01-08T11:00:00Z',
    readTime: 7,
    status: 'published',
    tags: ['investment', 'trends', 'market', 'analysis'],
    seoMetadata: {
      metaDescription: 'Explore gemstone investment trends and predictions for 2024.',
      metaKeywords: 'gemstone investment, trends, market analysis, collecting',
      ogTitle: 'Gemstone Investment Trends 2024',
      ogDescription: 'Analysis of gemstone investment trends for 2024',
      canonicalUrl: 'https://mineralgallery.com/blog/gemstone-investment-trends-2024',
    },
    stats: {
      views: 2789,
      shares: 234,
      comments: 31,
    },
    relatedPostIds: ['post-002', 'post-005'],
  },
  {
    id: 'post-005',
    title: 'Ethical Sourcing: Our Commitment to Sustainability',
    slug: 'ethical-sourcing-commitment-sustainability',
    excerpt: 'Discover how we ensure every gemstone is ethically sourced and environmentally responsible.',
    content: '<p>Full article about ethical sourcing...</p>',
    category: 'News',
    author: authors[2],
    featuredImage: {
      url: '/blog/ethical-sourcing.jpg',
      alt: 'Sustainable mining practices',
      caption: 'Our ethical sourcing partners',
    },
    publishedDate: '2024-01-05T14:30:00Z',
    updatedDate: '2024-01-05T14:30:00Z',
    readTime: 5,
    status: 'published',
    tags: ['ethics', 'sustainability', 'sourcing', 'environment'],
    seoMetadata: {
      metaDescription: 'Learn about our ethical gemstone sourcing practices and sustainability commitment.',
      metaKeywords: 'ethical sourcing, sustainability, conflict-free gems, environment',
      ogTitle: 'Ethical Sourcing: Our Commitment to Sustainability',
      ogDescription: 'Discover our ethical and sustainable sourcing practices',
      canonicalUrl: 'https://mineralgallery.com/blog/ethical-sourcing-commitment-sustainability',
    },
    stats: {
      views: 1567,
      shares: 112,
      comments: 8,
    },
    relatedPostIds: ['post-001', 'post-003'],
  },
  {
    id: 'post-006',
    title: 'How to Start a Mineral Collection: Beginner\'s Guide',
    slug: 'how-to-start-mineral-collection-beginners-guide',
    excerpt: 'Everything you need to know to start your first mineral collection without breaking the bank.',
    content: '<p>Full article about starting a collection...</p>',
    category: 'Guides',
    author: authors[0],
    featuredImage: {
      url: '/blog/beginner-collection.jpg',
      alt: 'Beginner mineral collector starter kit',
      caption: 'Start your mineral collection journey',
    },
    publishedDate: '2024-01-03T10:00:00Z',
    updatedDate: '2024-01-03T10:00:00Z',
    readTime: 6,
    status: 'published',
    tags: ['collecting', 'beginner', 'guide', 'tips'],
    seoMetadata: {
      metaDescription: 'Beginner\'s guide to starting a mineral collection with expert tips.',
      metaKeywords: 'mineral collection, beginner, guide, how to start',
      ogTitle: 'How to Start a Mineral Collection: Beginner\'s Guide',
      ogDescription: 'Complete beginner\'s guide to mineral collecting',
      canonicalUrl: 'https://mineralgallery.com/blog/how-to-start-mineral-collection-beginners-guide',
    },
    stats: {
      views: 4123,
      shares: 267,
      comments: 42,
    },
    relatedPostIds: ['post-001', 'post-004'],
  },
];

export const categories = [
  {
    name: 'Guides',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    icon: '📚',
    description: 'Tutorials, how-tos, best practices',
    count: blogPosts.filter(p => p.category === 'Guides').length,
  },
  {
    name: 'News',
    color: 'bg-green-500/20 text-green-400 border-green-500/50',
    icon: '📰',
    description: 'Company updates, announcements',
    count: blogPosts.filter(p => p.category === 'News').length,
  },
  {
    name: 'Education',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    icon: '🎓',
    description: 'Learning resources, explanations',
    count: blogPosts.filter(p => p.category === 'Education').length,
  },
  {
    name: 'Trends',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    icon: '📈',
    description: 'Industry insights, predictions',
    count: blogPosts.filter(p => p.category === 'Trends').length,
  },
];
