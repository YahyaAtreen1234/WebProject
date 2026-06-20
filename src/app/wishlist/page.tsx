import Wishlist from '@/src/components/Wishlist';

export const metadata = {
  title: 'My Wishlist',
  description: 'View and manage your wishlist',
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-900 via-midnight-800 to-midnight-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Wishlist />
      </div>
    </div>
  );
}
