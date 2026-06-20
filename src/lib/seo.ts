// SEO & Metadata utilities

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
}

export const generateMetadata = (page: PageMetadata) => {
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords?.join(', ') || '',
    openGraph: {
      title: page.title,
      description: page.description,
      images: page.image
        ? [
            {
              url: page.image,
              width: 1200,
              height: 630,
              alt: page.title,
            },
          ]
        : [],
      type: page.type || 'website',
      url: page.url,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: page.image ? [page.image] : [],
    },
  };
};

export const generateSchemaMarkup = (type: string, data: any) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return JSON.stringify(schema);
};

// Common schema types
export const generateProductSchema = (product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
}) => {
  return generateSchemaMarkup('Product', {
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: product.currency || 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating.toString(),
          reviewCount: (product.reviewCount || 0).toString(),
        }
      : undefined,
  });
};

export const generateOrganizationSchema = (org: {
  name: string;
  logo: string;
  url: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}) => {
  return generateSchemaMarkup('Organization', {
    name: org.name,
    url: org.url,
    logo: org.logo,
    ...(org.telephone && { telephone: org.telephone }),
    ...(org.email && { email: org.email }),
    ...(org.address && { address: org.address }),
  });
};

export const generateBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
) => {
  return generateSchemaMarkup('BreadcrumbList', {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: (index + 1).toString(),
      name: item.name,
      item: item.url,
    })),
  });
};
