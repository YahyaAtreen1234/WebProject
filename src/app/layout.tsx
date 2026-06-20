import type { Metadata } from 'next';
import Navigation from '@/src/components/Navigation';
import Footer from '@/src/components/Footer';
import { CartProvider } from '@/src/context/CartContext';
import { LanguageProvider } from '@/src/i18n';
import { CurrencyProvider } from '@/src/currency';
import './globals.css';

export const metadata: Metadata = {
  title: 'StonesLand | Premium Gemstones & Minerals E-Commerce',
  description:
    'Discover the world\'s most exquisite gemstones and minerals. Premium quality, ethically sourced, investment-grade pieces for collectors and enthusiasts.',
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
