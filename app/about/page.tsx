import type { Metadata } from 'next';
import HeroSection from '@/components/about/HeroSection';
import TrustBadgesSection from '@/components/about/TrustBadgesSection';
import CTASection from '@/components/about/CTASection';

// Read from the environment for the same reason robots.ts and sitemap.ts do:
// the canonical host belongs in configuration, not in five separate string
// literals that drift apart. Falls back to localhost so a developer running
// without an env file does not silently emit production URLs.
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

export const metadata: Metadata = {
  title: 'About StonesLand | Authentic Gemstones & Minerals Since 2015',
  description: 'Learn about StonesLand - your trusted source for authentic, ethically-sourced gemstones and minerals. Over 9 years of excellence in the industry.',
  keywords: 'gemstones, minerals, about us, mineral retailer, authentic gems, ethical sourcing',
  openGraph: {
    title: 'About StonesLand - Premium Gemstones & Minerals',
    description: 'Discover the story behind StonesLand. Trusted by 50,000+ customers worldwide.',
    type: 'website',
    url: `${baseUrl}/about`,
    images: [
      {
        // Was og-about.jpg, which is not in public/ and returned a 404 to every
        // crawler and link preview. The logo is the only image actually shipped.
        url: `${baseUrl}/logo.png`,
        width: 1240,
        height: 1240,
        alt: 'StonesLand - About Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About StonesLand',
    description: 'Your trusted source for authentic gemstones and minerals.',
  },
  alternates: {
    canonical: `${baseUrl}/about`,
  },
};

// JSON-LD Schema for Organization
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'StonesLand',
  description: 'Authentic gemstones and minerals marketplace',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  foundingDate: '2015',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@stonesland.com',
    telephone: '+1-800-MINERALS',
  },
  sameAs: [
    'https://www.facebook.com/stonesland',
    'https://twitter.com/stonesland',
    'https://www.linkedin.com/company/mineral-gallery',
  ],
  areaServed: 'Worldwide',
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    value: '50',
  },
};

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Main Content */}
      <main className="w-full overflow-hidden">
        {/* Hero Section */}
        <HeroSection />

        {/* Trust Badges Section */}
        <TrustBadgesSection />

        {/* CTA Section */}
        <CTASection />
      </main>
    </>
  );
}
