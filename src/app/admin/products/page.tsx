'use client';

import AdminProducts from '@/src/components/AdminProducts';

export default function AdminProductsPage() {
  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminProducts />
      </div>
    </div>
  );
}