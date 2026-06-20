'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

interface CustomerDetail extends Customer {
  profileImage?: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }>;
  addresses: Array<{
    id: string;
    name: string;
    addressLine1: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: string;
  };
}

export default function AdminCustomers() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

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
      fetchCustomers();
    }
  }, [token, search, offset]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/customers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetail = async (customerId: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedCustomer(data);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setOffset(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Customers</h2>
        <div className="text-sm text-midnight-400">
          Total: {total} customers
        </div>
      </div>

      <div className="card-glass p-4 border border-sapphire-500/20">
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={search}
          onChange={handleSearch}
          className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-8 text-midnight-300">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-midnight-400">
              No customers found
            </div>
          ) : (
            <div className="space-y-3">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => fetchCustomerDetail(customer.id)}
                  className={`card-glass p-4 border cursor-pointer transition-all ${
                    selectedCustomer?.id === customer.id
                      ? 'border-sapphire-500 bg-sapphire-500/10'
                      : 'border-sapphire-500/20 hover:border-sapphire-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{customer.name}</h3>
                      <p className="text-sm text-midnight-400">{customer.email}</p>
                      {customer.phone && (
                        <p className="text-sm text-midnight-500">{customer.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-sapphire-400">
                        {customer.totalOrders} orders
                      </p>
                      <p className="text-sm text-midnight-400">
                        ${customer.totalSpent.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {customer.emailVerified && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                        Verified
                      </span>
                    )}
                    <span className="text-xs text-midnight-500">
                      Joined {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-midnight-300">
                {offset + 1}-{Math.min(offset + limit, total)} of {total}
              </span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Customer Detail */}
        {selectedCustomer && (
          <div className="lg:col-span-1">
            <div className="card-glass p-6 border border-sapphire-500/20 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">Customer Details</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Name</p>
                  <p className="text-white font-semibold">{selectedCustomer.name}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">Email</p>
                  <p className="text-white">{selectedCustomer.email}</p>
                </div>

                {selectedCustomer.phone && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-midnight-400">
                      Phone
                    </p>
                    <p className="text-white">{selectedCustomer.phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wide text-midnight-400">
                    Joined
                  </p>
                  <p className="text-white">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 border-t border-midnight-700">
                  <p className="text-xs uppercase tracking-wide text-midnight-400 mb-3">
                    Statistics
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-midnight-300">Total Orders</span>
                      <span className="font-semibold text-white">
                        {selectedCustomer.stats.totalOrders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-midnight-300">Total Spent</span>
                      <span className="font-semibold text-sapphire-400">
                        ${selectedCustomer.stats.totalSpent.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-midnight-300">Avg Order Value</span>
                      <span className="font-semibold text-white">
                        ${selectedCustomer.stats.averageOrderValue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedCustomer.addresses.length > 0 && (
                  <div className="pt-4 border-t border-midnight-700">
                    <p className="text-xs uppercase tracking-wide text-midnight-400 mb-3">
                      Addresses ({selectedCustomer.addresses.length})
                    </p>
                    <div className="space-y-2">
                      {selectedCustomer.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="text-sm bg-midnight-800/50 p-2 rounded border border-midnight-700"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-white">{addr.name}</p>
                              <p className="text-midnight-400">{addr.addressLine1}</p>
                              <p className="text-midnight-500">
                                {addr.city}
                                {addr.state && `, ${addr.state}`} {addr.postalCode}
                              </p>
                            </div>
                            {addr.isDefault && (
                              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCustomer.orders.length > 0 && (
                  <div className="pt-4 border-t border-midnight-700">
                    <p className="text-xs uppercase tracking-wide text-midnight-400 mb-3">
                      Recent Orders
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedCustomer.orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="text-sm bg-midnight-800/50 p-2 rounded border border-midnight-700"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-mono text-white">
                                {order.orderNumber}
                              </p>
                              <p className="text-midnight-500 text-xs">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sapphire-400">
                                ${order.totalAmount.toFixed(2)}
                              </p>
                              <span className="text-xs bg-midnight-700/50 text-midnight-300 px-1.5 py-0.5 rounded">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
