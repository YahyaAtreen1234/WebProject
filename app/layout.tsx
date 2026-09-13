import type { Metadata } from 'next';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/i18n';
import { CurrencyProvider } from '@/currency';
import './globals.css';

const description =
  'Discover the world\'s most exquisite gemstones and minerals. Premium quality, ethically sourced, investment-grade pieces for collectors and enthusiasts.';

export const metadata: Metadata = {
  // Without this, the relative image paths below are emitted to crawlers and
  // link previews as-is, which they cannot resolve. Open Graph and Twitter
  // cards require absolute URLs.
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'),
  title: 'StonesLand | Premium Gemstones & Minerals E-Commerce',
  description,
  // Favicons come from app/icon.png and app/apple-icon.png (the monogram,
  // cropped from the lockup so it stays legible at 16px). Declaring `icons`
  // here would override that convention with the full, unreadable lockup.
  openGraph: {
    title: 'StonesLand | Premium Gemstones & Minerals',
    description,
    siteName: 'StonesLand',
    images: [{ url: '/logo.png', width: 1240, height: 1240, alt: 'StonesLand' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StonesLand | Premium Gemstones & Minerals',
    description,
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <AnnouncementBar />
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
