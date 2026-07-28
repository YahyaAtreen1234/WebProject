'use client';

import { useState } from 'react';
import Link from 'next/link';

interface OrderData {
  id: string;
  orderNumber: string;
  email: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  carrier?: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

const ORDER_STATUSES = [
  { status: 'pending', label: 'Order Pending', color: 'bg-yellow-500/20 text-yellow-400' },
  { status: 'confirmed', label: 'Order Confirmed', color: 'bg-blue-500/20 text-blue-400' },
  { status: 'processing', label: 'Processing', color: 'bg-blue-500/20 text-blue-400' },
  { status: 'shipped', label: 'Shipped', color: 'bg-sapphire-500/20 text-sapphire-400' },
  { status: 'in_transit', label: 'In Transit', color: 'bg-purple-500/20 text-purple-400' },
  { status: 'delivered', label: 'Delivered', color: 'bg-emerald-500/20 text-emerald-400' },
  { status: 'cancelled', label: 'Cancelled', color: 'bg-rose-500/20 text-rose-400' },
];

export default function OrdersPage() {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrderData(null);
    setHasSearched(true);

    try {
      const searchParams = new URLSearchParams();
      if (searchOrderNumber) searchParams.append('orderNumber', searchOrderNumber);
      if (searchEmail) searchParams.append('email', searchEmail);

      const response = await fetch(`/api/orders/search?${searchParams.toString()}`);

      if (!response.ok) {
        setError('Order not found. Please check your order number and email address.');
        return;
      }

      const data = await response.json();
      setOrderData(data);
    } catch (err) {
      setError('Failed to retrieve order. Please try again later.');
      console.error('[OrdersPage] Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = ORDER_STATUSES.find((s) => s.status === status);
    return statusObj?.color || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusLabel = (status: string) => {
    const statusObj = ORDER_STATUSES.find((s) => s.status === status);
    return statusObj?.label || status;
  };

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'in_transit', 'delivered'];
    return steps.indexOf(status) + 1;
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-black mb-4">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your order number and email address to track your shipment
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-gray-50 rounded-xl p-8 mb-12 border border-gray-200">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  value={searchOrderNumber}
                  onChange={(e) => setSearchOrderNumber(e.target.value)}
                  placeholder="e.g., ORD-2026-001234"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || (!searchOrderNumber && !searchEmail)}
              className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {/* No Results Message */}
        {hasSearched && !loading && !orderData && !error && (
          <div className="text-center py-12 text-gray-600">
            <p>No orders found matching your search criteria.</p>
          </div>
        )}

        {/* Order Details */}
        {orderData && (
          <div className="space-y-8">
            {/* Order Status Overview */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="text-2xl font-bold text-black">{orderData.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="text-2xl font-bold text-black">
                    {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Total</p>
                  <p className="text-2xl font-bold text-green-600">${orderData.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Status</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(orderData.status)}`}>
                    {getStatusLabel(orderData.status)}
                  </span>
                </div>
              </div>

              {/* Estimated Delivery */}
              {orderData.estimatedDelivery && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-semibold">Estimated Delivery</p>
                  <p className="text-blue-900 font-bold">
                    {new Date(orderData.estimatedDelivery).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Tracking Timeline */}
            {(orderData.status !== 'pending' && orderData.status !== 'cancelled') && (
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h2 className="text-xl font-bold text-black mb-8">Tracking Timeline</h2>
                <div className="space-y-6">
                  {ORDER_STATUSES.slice(0, 6).map((step, index) => {
                    const isCompleted = getStatusStep(orderData.status) > index;
                    const isCurrent = step.status === orderData.status;

                    return (
                      <div key={step.status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              isCompleted || isCurrent
                                ? 'bg-black text-white'
                                : 'bg-gray-300 text-gray-600'
                            }`}
                          >
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          {index < 5 && (
                            <div className={`w-1 h-12 mt-2 ${isCompleted ? 'bg-black' : 'bg-gray-300'}`} />
                          )}
                        </div>
                        <div className="pt-1">
                          <p className={`font-semibold ${isCompleted || isCurrent ? 'text-black' : 'text-gray-500'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-green-600 font-semibold">Current Status</p>
                          )}
                          {isCompleted && !isCurrent && (
                            <p className="text-sm text-gray-500">Completed</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping Information */}
            {(orderData.trackingNumber || orderData.carrier) && (
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h2 className="text-xl font-bold text-black mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orderData.carrier && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Carrier</p>
                      <p className="text-lg font-semibold text-black">{orderData.carrier}</p>
                    </div>
                  )}
                  {orderData.trackingNumber && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Tracking Number</p>
                      <p className="text-lg font-semibold text-black font-mono">{orderData.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-xl font-bold text-black mb-6">Order Items</h2>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-gray-200 last:border-b-0">
                    <div>
                      <p className="font-semibold text-black">{item.title}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-black">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-xl font-bold text-black mb-6">Shipping Address</h2>
              <p className="text-gray-700 leading-relaxed">
                {orderData.address}<br />
                {orderData.city}, {orderData.postalCode}<br />
                {orderData.country}
              </p>
            </div>

            {/* Support Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-700 mb-4">
                Have questions about your order?
              </p>
              <Link
                href="/contact"
                className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
