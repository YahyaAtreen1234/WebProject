'use client';

import { useState, useEffect } from 'react';

interface DeliveryStats {
  total: number;
  pending: number;
  inTransit: number;
  outForDelivery: number;
  delivered: number;
  failed: number;
  totalRevenue: number;
  averageDeliveryTime: number;
}

interface Delivery {
  id: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  currentLocation: string;
  totalShippingCost: number;
  estimatedDelivery: string;
  customerName?: string;
}

export default function AdvancedDeliveryPanel() {
  const [stats, setStats] = useState<DeliveryStats>({
    total: 200,
    pending: 12,
    inTransit: 24,
    outForDelivery: 8,
    delivered: 156,
    failed: 0,
    totalRevenue: 4800,
    averageDeliveryTime: 5.2,
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'active' | 'analytics' | 'addresses' | 'rates'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('all');

  useEffect(() => {
    // In a real app, fetch from API
    const mockDeliveries: Delivery[] = [
      {
        id: '1',
        trackingNumber: 'TRK-2024-001234',
        carrier: 'FedEx',
        status: 'in_transit',
        currentLocation: 'Memphis, TN',
        totalShippingCost: 45.99,
        estimatedDelivery: '2024-06-20',
        customerName: 'John Doe',
      },
      {
        id: '2',
        trackingNumber: 'TRK-2024-001235',
        carrier: 'UPS',
        status: 'out_for_delivery',
        currentLocation: 'Los Angeles, CA',
        totalShippingCost: 32.50,
        estimatedDelivery: '2024-06-19',
        customerName: 'Jane Smith',
      },
      {
        id: '3',
        trackingNumber: 'TRK-2024-001236',
        carrier: 'DHL',
        status: 'delivered',
        currentLocation: 'San Francisco, CA',
        totalShippingCost: 58.99,
        estimatedDelivery: '2024-06-18',
        customerName: 'Bob Johnson',
      },
    ];
    setDeliveries(mockDeliveries);
  }, []);

  const filteredDeliveries = deliveries.filter(
    (d) =>
      (carrierFilter === 'all' || d.carrier === carrierFilter) &&
      (d.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.currentLocation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
      picked: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      in_transit: 'bg-sapphire-500/20 text-sapphire-300 border-sapphire-500/50',
      out_for_delivery: 'bg-gold-500/20 text-gold-300 border-gold-500/50',
      delivered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      failed: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-sapphire-900/20 to-amethyst-900/20 border-b border-sapphire-500/20 sticky top-0 z-40">
        <div className="container-gutter py-6">
          <h1 className="text-h2 mb-2">🚚 Delivery Management Center</h1>
          <p className="text-midnight-300">Real-time tracking and shipment analytics</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-gutter py-8">
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Total Shipments',
                  value: stats.total,
                  icon: '📦',
                  color: 'from-sapphire-600',
                },
                {
                  label: 'In Transit',
                  value: stats.inTransit,
                  icon: '🚛',
                  color: 'from-gold-600',
                },
                {
                  label: 'Delivered',
                  value: stats.delivered,
                  icon: '✅',
                  color: 'from-emerald-600',
                },
                {
                  label: 'Revenue',
                  value: `$${stats.totalRevenue.toFixed(2)}`,
                  icon: '💰',
                  color: 'from-rose-600',
                },
              ].map((kpi, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${kpi.color} to-transparent rounded-2xl p-6 border border-sapphire-500/20 hover:border-sapphire-400/50 transition-all cursor-pointer group`}
                >
                  <div className="text-3xl mb-3 group-hover:scale-125 transition-transform">
                    {kpi.icon}
                  </div>
                  <p className="text-sm text-midnight-300 mb-2">{kpi.label}</p>
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Breakdown */}
              <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Status Distribution</h3>
                <div className="space-y-4">
                  {[
                    { status: 'Pending', count: stats.pending, color: 'bg-gray-500' },
                    { status: 'In Transit', count: stats.inTransit, color: 'bg-sapphire-500' },
                    {
                      status: 'Out for Delivery',
                      count: stats.outForDelivery,
                      color: 'bg-gold-500',
                    },
                    { status: 'Delivered', count: stats.delivered, color: 'bg-emerald-500' },
                  ].map((item, i) => {
                    const percentage = (item.count / stats.total) * 100;
                    return (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-midnight-200">{item.status}</span>
                          <span className="text-sm font-bold text-white">{item.count}</span>
                        </div>
                        <div className="w-full bg-midnight-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`${item.color} h-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6">Performance Metrics</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-midnight-300 mb-2">Avg. Delivery Time</p>
                    <p className="text-3xl font-bold text-sapphire-300">
                      {stats.averageDeliveryTime} days
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-midnight-300 mb-2">Success Rate</p>
                    <p className="text-3xl font-bold text-emerald-300">
                      {(((stats.delivered) / stats.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-midnight-300 mb-2">Revenue/Shipment</p>
                    <p className="text-2xl font-bold text-gold-300">
                      ${(stats.totalRevenue / stats.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'active' && (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="card-glass backdrop-blur-md p-6 rounded-2xl space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search by tracking number or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-midnight-800/50 border border-sapphire-500/30 text-white placeholder-midnight-400 focus:outline-none focus:border-sapphire-400"
                />
                <select
                  value={carrierFilter}
                  onChange={(e) => setCarrierFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-midnight-800/50 border border-sapphire-500/30 text-white focus:outline-none focus:border-sapphire-400"
                >
                  <option value="all">All Carriers</option>
                  <option value="FedEx">FedEx</option>
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL</option>
                </select>
              </div>
            </div>

            {/* Active Deliveries */}
            <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6">
                Active Deliveries ({filteredDeliveries.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between p-4 bg-midnight-800/50 rounded-lg border border-sapphire-500/20 hover:border-sapphire-400/50 transition-all group cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <code className="text-sm text-sapphire-300 font-mono">
                          {delivery.trackingNumber}
                        </code>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(delivery.status)}`}
                        >
                          {delivery.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-midnight-400">{delivery.carrier}</span>
                      </div>
                      <p className="text-sm text-midnight-200">{delivery.currentLocation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gold-300">
                        ${delivery.totalShippingCost.toFixed(2)}
                      </p>
                      <p className="text-xs text-midnight-400">
                        Est: {new Date(delivery.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 text-xl group-hover:scale-125 transition-transform">
                      →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carrier Distribution */}
            <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Carrier Distribution</h3>
              <div className="space-y-4">
                {[
                  { name: 'FedEx', count: 65, color: 'from-purple-600' },
                  { name: 'UPS', count: 85, color: 'from-yellow-600' },
                  { name: 'DHL', count: 50, color: 'from-red-600' },
                ].map((carrier, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex justify-between mb-2 group-hover:translate-x-1 transition-transform">
                      <span className="text-sm font-semibold text-white">{carrier.name}</span>
                      <span className="text-sm text-midnight-300">{carrier.count} shipments</span>
                    </div>
                    <div className={`h-3 bg-gradient-to-r ${carrier.color} to-transparent rounded-full`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Top Routes</h3>
              <div className="space-y-3">
                {[
                  { route: 'CA → NY', value: 1250, icon: '🛣️' },
                  { route: 'TX → FL', value: 890, icon: '🛣️' },
                  { route: 'WA → MA', value: 760, icon: '🛣️' },
                ].map((route, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-midnight-800/50 rounded-lg hover:bg-midnight-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{route.icon}</span>
                      <span className="font-semibold text-white">{route.route}</span>
                    </div>
                    <span className="font-bold text-gold-300">${route.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Time Trends */}
            <div className="card-glass backdrop-blur-md p-6 rounded-2xl lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-6">Delivery Time Trends</h3>
              <div className="h-64 flex items-end justify-around gap-2 px-4">
                {[
                  { day: 'Mon', time: 4.2 },
                  { day: 'Tue', time: 5.1 },
                  { day: 'Wed', time: 4.8 },
                  { day: 'Thu', time: 5.5 },
                  { day: 'Fri', time: 5.2 },
                  { day: 'Sat', time: 6.1 },
                  { day: 'Sun', time: 5.9 },
                ].map((data, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-sapphire-500 to-sapphire-400 rounded-t-lg hover:from-sapphire-400 hover:to-sapphire-300 transition-all"
                      style={{ height: `${(data.time / 7) * 100}%` }}
                      title={`${data.time} days`}
                    />
                    <span className="text-xs text-midnight-400">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'addresses' && (
          <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Saved Delivery Addresses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Home', addr: '123 Main St, New York, NY 10001' },
                { name: 'Office', addr: '456 Business Ave, San Francisco, CA 94102' },
                { name: 'Warehouse', addr: '789 Industrial Blvd, Dallas, TX 75001' },
              ].map((address, i) => (
                <div
                  key={i}
                  className="p-4 bg-midnight-800/50 rounded-lg border border-sapphire-500/20 hover:border-sapphire-400/50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{address.name}</h4>
                    <button className="text-midnight-400 group-hover:text-sapphire-300 transition-colors">
                      ✎
                    </button>
                  </div>
                  <p className="text-sm text-midnight-300">{address.addr}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'rates' && (
          <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Shipping Rates</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sapphire-500/20">
                    <th className="text-left py-3 px-4 text-white font-bold">Carrier</th>
                    <th className="text-left py-3 px-4 text-white font-bold">Method</th>
                    <th className="text-left py-3 px-4 text-white font-bold">Base Rate</th>
                    <th className="text-left py-3 px-4 text-white font-bold">Per KG</th>
                    <th className="text-left py-3 px-4 text-white font-bold">Est. Days</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { carrier: 'FedEx', method: 'Standard', base: '$15.00', kg: '$0.50', days: 5 },
                    { carrier: 'FedEx', method: 'Express', base: '$25.00', kg: '$0.75', days: 2 },
                    { carrier: 'UPS', method: 'Standard', base: '$12.00', kg: '$0.45', days: 5 },
                    { carrier: 'UPS', method: 'Express', base: '$22.00', kg: '$0.70', days: 2 },
                    { carrier: 'DHL', method: 'International', base: '$35.00', kg: '$1.00', days: 7 },
                  ].map((rate, i) => (
                    <tr
                      key={i}
                      className="border-b border-midnight-700 hover:bg-midnight-800/50 transition-all"
                    >
                      <td className="py-3 px-4 text-white">{rate.carrier}</td>
                      <td className="py-3 px-4 text-midnight-300">{rate.method}</td>
                      <td className="py-3 px-4 text-gold-300 font-semibold">{rate.base}</td>
                      <td className="py-3 px-4 text-sapphire-300">{rate.kg}</td>
                      <td className="py-3 px-4 text-emerald-300">{rate.days} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="fixed bottom-6 right-6 flex gap-2 flex-wrap justify-end max-w-xs">
        {[
          { id: 'overview' as const, label: 'Overview', icon: '📊' },
          { id: 'active' as const, label: 'Active', icon: '🚛' },
          { id: 'analytics' as const, label: 'Analytics', icon: '📈' },
          { id: 'addresses' as const, label: 'Addresses', icon: '📍' },
          { id: 'rates' as const, label: 'Rates', icon: '💰' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
              selectedTab === tab.id
                ? 'bg-sapphire-600 text-white shadow-lg'
                : 'bg-midnight-800/80 border border-sapphire-500/30 text-midnight-200 hover:text-white hover:border-sapphire-400'
            }`}
            title={tab.label}
          >
            <span className="hidden sm:inline">{tab.icon} </span>
            <span className="hidden md:inline">{tab.label}</span>
            <span className="md:hidden">{tab.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
