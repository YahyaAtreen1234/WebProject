'use client';

import { useState, useEffect } from 'react';

interface UserInfo {
  name: string;
  email: string;
  phone?: string;
  joinDate: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: number;
  trackingNumber?: string;
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
  orderNumber?: string;
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
    setOrders([
      {
        id: '1',
        orderNumber: 'ORD-2026-0615-001',
        date: '2026-06-15',
        status: 'Delivered',
        total: 349.99,
        items: 3,
        trackingNumber: 'TRK-20260615-A1B2',
      },
      {
        id: '2',
        orderNumber: 'ORD-2026-0610-005',
        date: '2026-06-10',
        status: 'In Transit',
        total: 599.99,
        items: 2,
        trackingNumber: 'TRK-20260610-C3D4',
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
        orderNumber: 'ORD-2026-0615-001',
        trackingNumber: 'TRK-20260615-A1B2',
        status: 'Delivered',
        carrier: 'FedEx',
        estimatedDelivery: '2026-06-18',
      },
      {
        id: '2',
        orderNumber: 'ORD-2026-0610-005',
        trackingNumber: 'TRK-20260610-C3D4',
        status: 'In Transit',
        carrier: 'UPS',
        estimatedDelivery: '2026-06-20',
      },
    ]);

    setTotalSpent(1199.97);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400';
      case 'in transit':
        return 'bg-blue-500/20 text-blue-400';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
    { id: 'shipments', label: 'Shipments', icon: '🚚' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg">
                👤
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{userInfo.name}</h1>
                <p className="text-gray-400">{userInfo.email}</p>
              </div>
            </div>
            <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition">
              Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
              <p className="text-gray-400 text-sm mb-2">Total Orders</p>
              <p className="text-3xl font-bold text-white">{orders.length}</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
              <p className="text-gray-400 text-sm mb-2">Total Spent</p>
              <p className="text-3xl font-bold text-green-400">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
              <p className="text-gray-400 text-sm mb-2">Active Shipments</p>
              <p className="text-3xl font-bold text-blue-400">
                {shipments.filter((s) => s.status !== 'Delivered').length}
              </p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 backdrop-blur">
              <p className="text-gray-400 text-sm mb-2">Member Since</p>
              <p className="text-3xl font-bold text-yellow-400">2024</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-700">
          <div className="flex gap-1 overflow-x-auto pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-white bg-gray-800/50'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Orders */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="bg-gray-900/50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-900 transition">
                      <div className="flex-1">
                        <p className="text-white font-semibold">{order.orderNumber}</p>
                        <p className="text-gray-400 text-sm">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${order.total.toFixed(2)}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition cursor-pointer">
                  <span className="text-4xl mb-3 block">📦</span>
                  <p className="text-gray-400 text-sm mb-1">My Orders</p>
                  <p className="text-2xl font-bold text-white">{orders.length}</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-green-500/50 transition cursor-pointer">
                  <span className="text-4xl mb-3 block">📍</span>
                  <p className="text-gray-400 text-sm mb-1">Saved Addresses</p>
                  <p className="text-2xl font-bold text-white">{addresses.length}</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-yellow-500/50 transition cursor-pointer">
                  <span className="text-4xl mb-3 block">💳</span>
                  <p className="text-gray-400 text-sm mb-1">Payment Methods</p>
                  <p className="text-2xl font-bold text-white">{paymentMethods.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-bold text-white mb-6">My Orders</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-900/50 rounded-lg p-6 hover:bg-gray-900 transition border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white font-bold text-lg">{order.orderNumber}</p>
                        <p className="text-gray-400">{order.date} • {order.items} items</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">${order.total.toFixed(2)}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    {order.trackingNumber && (
                      <div className="pt-4 border-t border-gray-700/50">
                        <p className="text-sm text-gray-400">Tracking: <span className="text-white font-mono">{order.trackingNumber}</span></p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipments Tab */}
          {activeTab === 'shipments' && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-bold text-white mb-6">Shipments</h2>
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <div key={shipment.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50 hover:border-blue-500/50 transition">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white font-bold">{shipment.trackingNumber}</p>
                        <p className="text-gray-400">{shipment.carrier}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </div>
                    <p className="text-gray-400">
                      <span className="text-blue-400">📅 Expected Delivery:</span> {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Saved Addresses</h2>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
                  + Add Address
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/50 hover:border-green-500/50 transition">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-bold">{address.type}</p>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded font-semibold">Default</span>
                      )}
                    </div>
                    <p className="text-gray-300">{address.street}</p>
                    <p className="text-gray-400">{address.city}</p>
                    <p className="text-gray-400">{address.country}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
                <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-semibold transition">
                  + Add Card
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg p-6 border border-gray-700/50 hover:border-yellow-500/50 transition">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-white font-bold text-lg">{method.type}</p>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded font-semibold">Default</span>
                      )}
                    </div>
                    <p className="text-2xl text-gray-300 tracking-widest font-mono mb-3">•••• {method.lastFour}</p>
                    <p className="text-gray-400 text-sm">Expires: {method.expiry}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur">
              <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Email Notifications</p>
                      <p className="text-gray-400 text-sm">Receive order updates</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">SMS Notifications</p>
                      <p className="text-gray-400 text-sm">Delivery alerts via text</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" />
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/50">
                  <button className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition">
                    🔒 Change Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
