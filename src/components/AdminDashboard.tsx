'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminCustomers from './AdminCustomers';
import AdminAnalytics from './AdminAnalytics';
import AdminDiscounts from './AdminDiscounts';
import AdminCustomOrders from './AdminCustomOrders';
import AdminSupportTickets from './AdminSupportTickets';
import AdminSettings from './AdminSettings';
import { clearStoredAdminAuth, getStoredAdminInfo } from '@/lib/clientAuth';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const info = getStoredAdminInfo();
    if (info?.email) {
      setAdminName(info.email);
    } else if (info?.name) {
      setAdminName(info.name);
    }
    console.log('Admin dashboard loaded:', info);
  }, []);

  const handleLogout = () => {
    clearStoredAdminAuth();
    router.push('/admin/login');
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'orders', label: '📦 Orders', icon: '📦' },
    { id: 'products', label: '🛍️ Products', icon: '🛍️' },
    { id: 'customers', label: '👥 Customers', icon: '👥' },
    { id: 'custom-orders', label: '✨ Custom Orders', icon: '✨' },
    { id: 'support', label: '💬 Support Tickets', icon: '💬' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'discounts', label: '🏷️ Discounts', icon: '🏷️' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-midnight-950">
      {/* Admin Header */}
      <div className="bg-midnight-900 border-b border-midnight-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              ✨ Admin Panel
            </h1>
            {adminName && (
              <p className="text-sm text-sapphire-300 mt-1">Signed in as {adminName}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-midnight-900/50 border-b border-midnight-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-sapphire-500 text-sapphire-400'
                    : 'border-transparent text-midnight-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Welcome to Admin Panel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-glass p-6 border border-sapphire-500/20 text-center">
                <p className="text-3xl mb-2">📦</p>
                <p className="text-midnight-400 text-sm">Manage Orders</p>
                <p className="text-white font-semibold">Click Orders Tab</p>
              </div>
              <div className="card-glass p-6 border border-sapphire-500/20 text-center">
                <p className="text-3xl mb-2">🛍️</p>
                <p className="text-midnight-400 text-sm">Manage Products</p>
                <p className="text-white font-semibold">Click Products Tab</p>
              </div>
              <div className="card-glass p-6 border border-sapphire-500/20 text-center">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-midnight-400 text-sm">View Customers</p>
                <p className="text-white font-semibold">Click Customers Tab</p>
              </div>
              <div className="card-glass p-6 border border-sapphire-500/20 text-center">
                <p className="text-3xl mb-2">📈</p>
                <p className="text-midnight-400 text-sm">View Analytics</p>
                <p className="text-white font-semibold">Click Analytics Tab</p>
              </div>
            </div>

            <div className="card-glass p-8 border border-sapphire-500/20 text-center">
              <h3 className="text-xl font-bold text-white mb-4">Admin Panel Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-sapphire-400 mb-2">📊 Dashboard</h4>
                  <ul className="text-midnight-300 text-sm space-y-1">
                    <li>• Quick stats overview</li>
                    <li>• Key metrics</li>
                    <li>• Recent activity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sapphire-400 mb-2">📦 Order Management</h4>
                  <ul className="text-midnight-300 text-sm space-y-1">
                    <li>• View all orders</li>
                    <li>• Update status</li>
                    <li>• Search & filter</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sapphire-400 mb-2">🛍️ Product Management</h4>
                  <ul className="text-midnight-300 text-sm space-y-1">
                    <li>• Add new products</li>
                    <li>• Edit details</li>
                    <li>• Manage inventory</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sapphire-400 mb-2">👥 Customer Management</h4>
                  <ul className="text-midnight-300 text-sm space-y-1">
                    <li>• View all customers</li>
                    <li>• Customer details</li>
                    <li>• Order history</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sapphire-400 mb-2">📈 Analytics</h4>
                  <ul className="text-midnight-300 text-sm space-y-1">
                    <li>• Revenue trends</li>
                    <li>• Top products</li>
                    <li>• Customer insights</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sapphire-400 mb-2">🏷️ Discount Management</h4>
                  <ul className="text-midnight-300 text-sm space-y-1">
                    <li>• Create coupons</li>
                    <li>• Track usage</li>
                    <li>• Manage campaigns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'customers' && <AdminCustomers />}
        {activeTab === 'custom-orders' && <AdminCustomOrders />}
        {activeTab === 'support' && <AdminSupportTickets />}
        {activeTab === 'analytics' && <AdminAnalytics />}
        {activeTab === 'discounts' && <AdminDiscounts />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
}