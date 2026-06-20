'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
  }>;
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile' | 'addresses' | 'wishlist' | 'custom-orders' | 'support'>('overview');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          router.push('/user/login');
          return;
        }

        // Get user data
        const userRes = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) {
          localStorage.removeItem('userToken');
          router.push('/user/login');
          return;
        }

        const userData = await userRes.json();
        setUser(userData);

        // Get orders
        const ordersRes = await fetch(`/api/orders?email=${userData.email}`);
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    router.push('/user/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-midnight-800 rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-midnight-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Welcome, {user.name}!</h1>
            <p className="text-midnight-400">Manage your account and orders</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-semibold"
          >
            Sign Out
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-midnight-700 overflow-x-auto">
          {(['overview', 'orders', 'profile', 'addresses', 'wishlist', 'custom-orders', 'support'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold capitalize whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-sapphire-400 border-b-2 border-sapphire-400'
                  : 'text-midnight-400 hover:text-white'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Card */}
            <div className="lg:col-span-1">
              <div className="card-glass p-6 border border-sapphire-500/20">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sapphire-400 to-amethyst-400 mx-auto mb-4"></div>
                  <h2 className="text-xl font-bold text-white">{user.name}</h2>
                  <p className="text-midnight-400 text-sm">{user.email}</p>
                </div>
                <div className="space-y-3">
                  {user.phone && (
                    <div className="flex justify-between text-sm">
                      <span className="text-midnight-400">Phone</span>
                      <span className="text-white">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-midnight-400">Member Since</span>
                    <span className="text-white">June 2026</span>
                  </div>
                </div>
                <Link
                  href="#profile"
                  onClick={() => setActiveTab('profile')}
                  className="block w-full mt-6 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg transition-colors font-semibold text-center"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="card-glass p-6 border border-sapphire-500/20">
                <h3 className="text-xl font-bold text-white mb-4">Recent Orders</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-midnight-400 mb-4">No orders yet</p>
                    <Link
                      href="/gallery"
                      className="inline-block px-6 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg font-semibold"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.orderNumber}`}
                        className="block p-4 bg-midnight-800/50 rounded-lg hover:bg-midnight-800 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-white">{order.orderNumber}</p>
                            <p className="text-sm text-midnight-400">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sapphire-400 font-semibold">${order.totalAmount.toFixed(2)}</p>
                            <p className={`text-xs font-semibold capitalize ${
                              order.status === 'delivered' ? 'text-emerald-400' : 'text-yellow-400'
                            }`}>
                              {order.status}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {orders.length > 3 && (
                  <Link
                    href="#orders"
                    onClick={() => setActiveTab('orders')}
                    className="block text-center mt-4 text-sapphire-400 hover:text-sapphire-300 font-semibold"
                  >
                    View All Orders →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="card-glass p-6 border border-sapphire-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-midnight-400 mb-6">No orders found</p>
                <Link
                  href="/gallery"
                  className="inline-block px-8 py-3 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg font-semibold"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.orderNumber}`}
                    className="block p-4 border border-sapphire-500/30 rounded-lg hover:bg-sapphire-500/10 transition-colors"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-midnight-400">Order Number</p>
                        <p className="font-semibold text-white">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-midnight-400">Date</p>
                        <p className="font-semibold text-white">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-midnight-400">Amount</p>
                        <p className="font-semibold text-sapphire-400">${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-midnight-400">Status</p>
                        <p className={`font-semibold capitalize ${
                          order.status === 'delivered' ? 'text-emerald-400' : 'text-yellow-400'
                        }`}>
                          {order.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sapphire-400 hover:text-sapphire-300 font-semibold">
                          View Details →
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card-glass p-6 border border-sapphire-500/20 max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-midnight-300 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm text-midnight-300 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm text-midnight-300 mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue={user.phone || ''}
                  className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
                  placeholder="Add phone number"
                />
              </div>
              <button
                type="button"
                className="w-full py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                disabled
              >
                Save Changes (Coming Soon)
              </button>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="card-glass p-6 border border-sapphire-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">Saved Addresses</h2>
            <div className="text-center py-12">
              <p className="text-midnight-400 mb-6">No saved addresses yet</p>
              <button className="px-6 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg font-semibold">
                Add Address (Coming Soon)
              </button>
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">My Wishlist</h2>
              <Link
                href="/wishlist"
                className="px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg font-semibold"
              >
                View Full Wishlist
              </Link>
            </div>
            <div className="card-glass p-6 border border-sapphire-500/20 text-center">
              <p className="text-midnight-300 mb-4">Manage your wishlist</p>
              <p className="text-sm text-midnight-400">
                Add products to your wishlist to save them for later
              </p>
            </div>
          </div>
        )}

        {/* Custom Orders Tab */}
        {activeTab === 'custom-orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Custom Orders</h2>
              <Link
                href="/custom-orders"
                className="px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg font-semibold"
              >
                View All Requests
              </Link>
            </div>
            <div className="card-glass p-6 border border-sapphire-500/20 text-center">
              <p className="text-midnight-300 mb-4">Request Custom Orders</p>
              <p className="text-sm text-midnight-400">
                Submit custom order requests and receive personalized quotes
              </p>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Help & Support</h2>
              <Link
                href="/support"
                className="px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg font-semibold"
              >
                Get Help
              </Link>
            </div>
            <div className="card-glass p-6 border border-sapphire-500/20 text-center">
              <p className="text-midnight-300 mb-4">Support Tickets</p>
              <p className="text-sm text-midnight-400">
                Create and manage support tickets for any issues or questions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
