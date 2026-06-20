import CustomOrders from '@/src/components/CustomOrders';

export const metadata = {
  title: 'Custom Orders',
  description: 'Request custom orders and special requests',
};

export default function CustomOrdersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-900 via-midnight-800 to-midnight-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CustomOrders />
      </div>
    </div>
  );
}
