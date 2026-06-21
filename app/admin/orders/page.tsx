'use client';

import AdminOrders from '@/components/AdminOrders';

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminOrders />
      </div>
    </div>
  );
}