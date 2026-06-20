'use client';

import AdminCustomers from '@/src/components/AdminCustomers';

export default function AdminCustomersPage() {
  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminCustomers />
      </div>
    </div>
  );
}
