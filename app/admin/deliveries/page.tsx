'use client';

import DeliveryAdmin from '@/components/DeliveryAdmin';

export default function AdminDeliveriesPage() {
  return (
    <div className="min-h-screen">
      <section className="container-gutter section-spacing pt-gutter-lg">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl md:text-h2">Delivery Management</h1>
          <p className="text-lg text-midnight-200">
            Monitor and manage all active shipments and deliveries
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'In Transit', value: '24', color: 'from-sapphire-600' },
            { label: 'Out for Delivery', value: '8', color: 'from-gold-600' },
            { label: 'Delivered', value: '156', color: 'from-emerald-600' },
            { label: 'Pending', value: '12', color: 'from-blue-600' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} to-transparent rounded-2xl p-6 border border-sapphire-500/20`}
            >
              <p className="text-sm text-midnight-200 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Delivery List */}
        <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
          <DeliveryAdmin />
        </div>
      </section>
    </div>
  );
}
