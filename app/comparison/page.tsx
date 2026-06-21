import ProductComparison from '@/components/ProductComparison';

export const metadata = {
  title: 'Compare Products',
  description: 'Compare products side by side',
};

export default function ComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-900 via-midnight-800 to-midnight-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductComparison />
      </div>
    </div>
  );
}
