'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Analytics {
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    averageOrderValue: number;
  };
  topProducts: Array<{
    productId: string;
    title: string;
    quantity: number;
    revenue: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    customerEmail: string;
    createdAt: string;
  }>;
  period: number;
}

interface RevenueTrend {
  data: Array<{
    date: string;
    revenue: number;
    displayDate: string;
  }>;
}

export default function AdminAnalytics() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (!savedToken) {
      router.push('/admin/login');
      return;
    }
    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [dashResponse, trendResponse] = await Promise.all([
        fetch(`/api/admin/analytics/dashboard?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/analytics/revenue-trend', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (dashResponse.ok) {
        const data = await dashResponse.json();
        setAnalytics(data);
      }

      if (trendResponse.ok) {
        const data = await trendResponse.json();
        setRevenueTrend(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token || loading || !analytics) {
    return <div className="text-center py-8 text-midnight-300">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Analytics & Reports</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-glass p-6 border border-sapphire-500/20">
          <p className="text-midnight-400 text-sm uppercase tracking-wide mb-2">
            Total Orders
          </p>
          <p className="text-3xl font-bold text-white">
            {analytics.metrics.totalOrders}
          </p>
          <p className="text-xs text-midnight-500 mt-2">Last {analytics.period} days</p>
        </div>

        <div className="card-glass p-6 border border-sapphire-500/20">
          <p className="text-midnight-400 text-sm uppercase tracking-wide mb-2">
            Total Revenue
          </p>
          <p className="text-3xl font-bold text-sapphire-400">
            ${analytics.metrics.totalRevenue.toFixed(2)}
          </p>
          <p className="text-xs text-midnight-500 mt-2">
            Avg: $
            {analytics.metrics.averageOrderValue.toFixed(2)}
            /order
          </p>
        </div>

        <div className="card-glass p-6 border border-sapphire-500/20">
          <p className="text-midnight-400 text-sm uppercase tracking-wide mb-2">
            New Customers
          </p>
          <p className="text-3xl font-bold text-emerald-400">
            {analytics.metrics.totalCustomers}
          </p>
          <p className="text-xs text-midnight-500 mt-2">Last {analytics.period} days</p>
        </div>

        <div className="card-glass p-6 border border-sapphire-500/20">
          <p className="text-midnight-400 text-sm uppercase tracking-wide mb-2">
            Avg Order Value
          </p>
          <p className="text-3xl font-bold text-white">
            ${analytics.metrics.averageOrderValue.toFixed(2)}
          </p>
          <p className="text-xs text-midnight-500 mt-2">Per transaction</p>
        </div>
      </div>

      {/* Revenue Trend */}
      {revenueTrend && (
        <div className="card-glass p-6 border border-sapphire-500/20">
          <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-end gap-1">
            {revenueTrend.data.map((day, index) => {
              const maxRevenue = Math.max(
                ...revenueTrend.data.map((d) => d.revenue)
              );
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-sapphire-500/30 hover:bg-sapphire-500/60 transition-colors rounded-t"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-midnight-500 mt-2 group-hover:text-midnight-300">
                    {day.displayDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="card-glass p-6 border border-sapphire-500/20">
          <h3 className="text-lg font-bold text-white mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {analytics.ordersByStatus.map((status) => (
              <div key={status.status}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-midnight-300 capitalize">{status.status}</span>
                  <span className="font-semibold text-white">{status.count}</span>
                </div>
                <div className="w-full bg-midnight-800 rounded-full h-2">
                  <div
                    className="bg-sapphire-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (status.count /
                          analytics.ordersByStatus.reduce((sum, s) => sum + s.count, 0)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card-glass p-6 border border-sapphire-500/20">
          <h3 className="text-lg font-bold text-white mb-4">Top Products</h3>
          <div className="space-y-3">
            {analytics.topProducts.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-start justify-between p-3 bg-midnight-800/50 rounded border border-midnight-700"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white">{index + 1}. {product.title}</p>
                  <p className="text-sm text-midnight-400">
                    {product.quantity} sold • ${product.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card-glass p-6 border border-sapphire-500/20">
        <h3 className="text-lg font-bold text-white mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-midnight-700">
                <th className="px-4 py-3 text-left text-midnight-300 font-semibold">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-midnight-300 font-semibold">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-midnight-300 font-semibold">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-midnight-300 font-semibold">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-midnight-300 font-semibold">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-midnight-800 hover:bg-midnight-800/50"
                >
                  <td className="px-4 py-3 text-white font-mono">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-midnight-300">
                    {order.customerEmail}
                  </td>
                  <td className="px-4 py-3 font-semibold text-sapphire-400">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-sapphire-500/20 text-sapphire-300 rounded text-xs capitalize">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-midnight-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
