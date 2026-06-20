'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  itemCount: number;
}

interface OrderDetail extends Order {
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    title: string;
    product: {
      id: string;
      title: string;
      price: number;
    };
  }>;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  delivery?: any;
  returns?: any[];
}

export default function AdminOrders() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
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
      fetchOrders();
    }
  }, [token, search, statusFilter, paymentStatusFilter, offset]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchOrderDetail(orderId);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-purple-500/20 text-purple-400',
    shipped: 'bg-cyan-500/20 text-cyan-400',
    delivered: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-rose-500/20 text-rose-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        <div className="text-sm text-midnight-400">
          Total: {total} orders
        </div>
      </div>

      <div className="card-glass p-4 border border-sapphire-500/20 space-y-4">
        <input
          type="text"
          placeholder="Search by order number, email, or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOffset(0);
          }}
          className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:outline-none focus:border-sapphire-500"
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setOffset(0);
            }}
            className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setOffset(0);
            }}
            className="px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white"
          >
            <option value="">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-8 text-midnight-300">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-midnight-400">
              No orders found
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => fetchOrderDetail(order.id)}
                  className={`card-glass p-4 border cursor-pointer transition-all ${
                    selectedOrder?.id === order.id
                      ? 'border-sapphire-500 bg-sapphire-500/10'
                      : 'border-sapphire-500/20 hover:border-sapphire-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-mono font-semibold text-white">
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-midnight-400">{order.customerName}</p>
                      <p className="text-xs text-midnight-500">{order.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sapphire-400">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-midnight-500">
                        {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        statusColors[order.status] || 'bg-midnight-700 text-midnight-300'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.paymentStatus === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span className="text-xs text-midnight-500 ml-auto">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

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

        {selectedOrder && (
          <div className="lg:col-span-1">
            <div className="card-glass p-6 border border-sapphire-500/20 sticky top-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Order Details</h3>

              <div>
                <p className="text-xs uppercase tracking-wide text-midnight-400">Order Number</p>
                <p className="text-white font-mono">{selectedOrder.orderNumber}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-midnight-400">Customer</p>
                <p className="text-white">{selectedOrder.customerName}</p>
                <p className="text-sm text-midnight-400">{selectedOrder.customerEmail}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-midnight-400">Status</p>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-midnight-800 border border-sapphire-500/30 rounded text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-midnight-400">Total</p>
                <p className="text-2xl font-bold text-sapphire-400">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </p>
              </div>

              <div className="pt-4 border-t border-midnight-700">
                <p className="text-xs uppercase tracking-wide text-midnight-400 mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="text-sm">
                      <p className="text-white">{item.product.title}</p>
                      <p className="text-midnight-400">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}