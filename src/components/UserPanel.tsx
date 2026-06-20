'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserInfo {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  joinDate: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  country: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: string;
  lastFour: string;
  expiry: string;
  isDefault: boolean;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  carrier: string;
  estimatedDelivery: string;
}

export default function UserPanel() {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    joinDate: '2024-01-15',
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    // Initialize with mock data
    setOrders([
      {
        id: '1',
        orderNumber: 'ORD-2026-0615-001',
        date: '2026-06-15',
        status: 'Delivered',
        total: 349.99,
        items: 3,
      },
      {
        id: '2',
        orderNumber: 'ORD-2026-0610-005',
        date: '2026-06-10',
        status: 'In Transit',
        total: 599.99,
        items: 2,
      },
      {
        id: '3',
        orderNumber: 'ORD-2026-0605-003',
        date: '2026-06-05',
        status: 'Processing',
        total: 249.99,
        items: 1,
      },
    ]);

    setAddresses([
      {
        id: '1',
        type: 'Home',
        street: '123 Main Street, Apt 4B',
        city: 'New York, NY 10001',
        country: 'USA',
        isDefault: true,
      },
      {
        id: '2',
        type: 'Work',
        street: '456 Business Ave, Suite 100',
        city: 'New York, NY 10002',
        country: 'USA',
        isDefault: false,
      },
    ]);

    setPaymentMethods([
      {
        id: '1',
        type: 'Visa',
        lastFour: '4242',
        expiry: '12/25',
        isDefault: true,
      },
      {
        id: '2',
        type: 'Mastercard',
        lastFour: '5555',
        expiry: '08/26',
        isDefault: false,
      },
    ]);

    setShipments([
      {
        id: '1',
        trackingNumber: 'TRK-20260615-A1B2',
        status: 'Delivered',
        carrier: 'FedEx',
        estimatedDelivery: '2026-06-18',
      },
      {
        id: '2',
        trackingNumber: 'TRK-20260610-C3D4',
        status: 'In Transit',
        carrier: 'UPS',
        estimatedDelivery: '2026-06-20',
      },
      {
        id: '3',
        trackingNumber: 'TRK-20260605-E5F6',
        status: 'Processing',
        carrier: 'DHL',
        estimatedDelivery: '2026-06-22',
      },
    ]);

    setTotalSpent(1199.97);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'in transit':
        return 'bg-sapphire-500/20 text-sapphire-400 border-sapphire-500/30';
      case 'processing':
        return 'bg-amethyst-500/20 text-amethyst-400 border-amethyst-500/30';
      case 'pending':
        return 'bg-gold-500/20 text-gold-400 border-gold-500/30';
      case 'cancelled':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-midnight-800 text-midnight-300 border-midnight-700';
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sapphire-400 via-amethyst-400 to-emerald-400 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">{userInfo.name}</h1>
              <p className="text-midnight-400">{userInfo.email}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-glass p-4 border border-sapphire-500/20">
              <p className="text-midnight-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white mt-1">{orders.length}</p>
            </div>
            <div className="card-glass p-4 border border-emerald-500/20">
              <p className="text-midnight-400 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="card-glass p-4 border border-amethyst-500/20">
              <p className="text-midnight-400 text-sm">Active Shipments</p>
              <p className="text-2xl font-bold text-amethyst-400 mt-1">
                {shipments.filter((s) => s.status !== 'Delivered').length}
              </p>
            </div>
            <div className="card-glass p-4 border border-gold-500/20">
              <p className="text-midnight-400 text-sm">Member Since</p>
              <p className="text-lg font-bold text-gold-400 mt-1">2024</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-4 border-b border-sapphire-500/20">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'orders', label: '📦 Orders', icon: '📦' },
              { id: 'shipments', label: '🚚 Shipments', icon: '🚚' },
              { id: 'addresses', label: '📍 Addresses', icon: '📍' },
              { id: 'payments', label: '💳 Payments', icon: '💳' },
              { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-semibold whitespace-nowrap transition-all rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-sapphire-600 text-white'
                    : 'text-midnight-400 hover:text-white hover:bg-sapphire-500/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Orders */}
            <div className="card-glass p-6 border border-sapphire-500/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Orders</h2>
                <Link href="#orders" className="text-sapphire-400 hover:text-sapphire-300 text-sm">
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-midnight-800/30 rounded-lg hover:bg-midnight-800/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-white font-semibold">{order.orderNumber}</p>
                      <p className="text-midnight-400 text-sm">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${order.total.toFixed(2)}</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Shipments */}
            <div className="card-glass p-6 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Active Shipments</h2>
                <Link href="#shipments" className="text-emerald-400 hover:text-emerald-300 text-sm">
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {shipments
                  .filter((s) => s.status !== 'Delivered')
                  .map((shipment) => (
                    <div key={shipment.id} className="p-4 bg-midnight-800/30 rounded-lg border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-white font-semibold">{shipment.trackingNumber}</p>
                          <p className="text-midnight-400 text-sm">{shipment.carrier}</p>
                        </div>
                        <span className="px-3 py-1 bg-sapphire-500/20 text-sapphire-400 rounded-full text-xs font-semibold border border-sapphire-500/30">
                          {shipment.status}
                        </span>
                      </div>
                      <p className="text-emerald-400 text-sm">
                        📅 Expected: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="#addresses"
                className="card-glass p-6 border border-amethyst-500/20 hover:border-amethyst-500/40 hover:bg-amethyst-500/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📍</span>
                  <div>
                    <p className="text-midnight-400 text-sm">Saved Addresses</p>
                    <p className="text-2xl font-bold text-white">{addresses.length}</p>
                  </div>
                </div>
              </Link>

              <Link
                href="#payments"
                className="card-glass p-6 border border-gold-500/20 hover:border-gold-500/40 hover:bg-gold-500/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💳</span>
                  <div>
                    <p className="text-midnight-400 text-sm">Payment Methods</p>
                    <p className="text-2xl font-bold text-white">{paymentMethods.length}</p>
                  </div>
                </div>
              </Link>

              <Link
                href="#settings"
                className="card-glass p-6 border border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚙️</span>
                  <div>
                    <p className="text-midnight-400 text-sm">Account Settings</p>
                    <p className="text-sm text-midnight-300">Manage preferences</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div id="orders" className="card-glass p-6 border border-sapphire-500/20">
            <h2 className="text-xl font-bold text-white mb-6">All Orders</h2>
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-midnight-800/30 rounded-lg hover:bg-midnight-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold">{order.orderNumber}</p>
                    <p className="text-midnight-400 text-sm">
                      {order.date} • {order.items} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${order.total.toFixed(2)}</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shipments' && (
          <div id="shipments" className="card-glass p-6 border border-emerald-500/20">
            <h2 className="text-xl font-bold text-white mb-6">Shipment Tracking</h2>
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="p-4 bg-midnight-800/30 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{shipment.trackingNumber}</p>
                      <p className="text-midnight-400 text-sm">{shipment.carrier}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        shipment.status
                      )}`}
                    >
                      {shipment.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-midnight-700">
                    <p className="text-emerald-400 text-sm">
                      📅 Expected: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </p>
                    <button className="text-sapphire-400 hover:text-sapphire-300 text-sm font-semibold">
                      Track →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div id="addresses" className="card-glass p-6 border border-amethyst-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Saved Addresses</h2>
              <button className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 transition-all font-semibold text-sm">
                + Add New Address
              </button>
            </div>
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="p-4 bg-midnight-800/30 rounded-lg border border-amethyst-500/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{address.type}</p>
                      <p className="text-midnight-400 text-sm mt-1">{address.street}</p>
                      <p className="text-midnight-400 text-sm">{address.city}</p>
                      <p className="text-midnight-400 text-sm">{address.country}</p>
                    </div>
                    {address.isDefault && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/30">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-midnight-700">
                    <button className="text-sapphire-400 hover:text-sapphire-300 text-sm font-semibold">
                      Edit
                    </button>
                    {!address.isDefault && (
                      <>
                        <span className="text-midnight-600">•</span>
                        <button className="text-rose-400 hover:text-rose-300 text-sm font-semibold">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div id="payments" className="card-glass p-6 border border-gold-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Payment Methods</h2>
              <button className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 transition-all font-semibold text-sm">
                + Add Payment Method
              </button>
            </div>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="p-4 bg-midnight-800/30 rounded-lg border border-gold-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">
                        {method.type} •••• {method.lastFour}
                      </p>
                      <p className="text-midnight-400 text-sm">Expires: {method.expiry}</p>
                    </div>
                    {method.isDefault && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/30">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-midnight-700">
                    <button className="text-sapphire-400 hover:text-sapphire-300 text-sm font-semibold">
                      Edit
                    </button>
                    {!method.isDefault && (
                      <>
                        <span className="text-midnight-600">•</span>
                        <button className="text-rose-400 hover:text-rose-300 text-sm font-semibold">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div id="settings" className="space-y-6">
            {/* Profile Settings */}
            <div className="card-glass p-6 border border-rose-500/20">
              <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-midnight-300 text-sm font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={userInfo.name}
                    className="w-full px-4 py-2 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-midnight-300 text-sm font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue={userInfo.email}
                    className="w-full px-4 py-2 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-midnight-300 text-sm font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue={userInfo.phone}
                    className="w-full px-4 py-2 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-500 focus:outline-none transition-colors"
                  />
                </div>
                <button className="px-6 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 transition-all font-semibold">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div className="card-glass p-6 border border-amethyst-500/20">
              <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
              <div className="space-y-3">
                <button className="w-full p-4 bg-midnight-800/30 rounded-lg hover:bg-midnight-800/50 transition-colors text-left border border-amethyst-500/20">
                  <p className="text-white font-semibold">🔐 Change Password</p>
                  <p className="text-midnight-400 text-sm mt-1">Update your password regularly for security</p>
                </button>
                <button className="w-full p-4 bg-midnight-800/30 rounded-lg hover:bg-midnight-800/50 transition-colors text-left border border-amethyst-500/20">
                  <p className="text-white font-semibold">🛡️ Two-Factor Authentication</p>
                  <p className="text-midnight-400 text-sm mt-1">Enabled • Requires code on login</p>
                </button>
                <button className="w-full p-4 bg-midnight-800/30 rounded-lg hover:bg-midnight-800/50 transition-colors text-left border border-amethyst-500/20">
                  <p className="text-white font-semibold">🔒 Login History</p>
                  <p className="text-midnight-400 text-sm mt-1">View recent login activity</p>
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="card-glass p-6 border border-gold-500/20">
              <h2 className="text-xl font-bold text-white mb-6">Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 bg-midnight-800/30 rounded-lg cursor-pointer hover:bg-midnight-800/50 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-white font-semibold">Receive order updates via email</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-midnight-800/30 rounded-lg cursor-pointer hover:bg-midnight-800/50 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-white font-semibold">Receive marketing emails</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-midnight-800/30 rounded-lg cursor-pointer hover:bg-midnight-800/50 transition-colors">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-white font-semibold">Notify me about special offers</span>
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card-glass p-6 border border-rose-500/20">
              <h2 className="text-xl font-bold text-rose-400 mb-6">Danger Zone</h2>
              <button className="w-full px-6 py-3 bg-rose-600/20 border border-rose-600/40 text-rose-400 rounded-lg hover:bg-rose-600/30 transition-all font-semibold">
                🗑️ Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
