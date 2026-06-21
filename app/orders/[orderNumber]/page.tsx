'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderData();
  }, [orderNumber]);

  const fetchOrderData = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        setOrderData(data);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'processing':
        return 'bg-sapphire-500/10 border-sapphire-500/30 text-sapphire-400';
      case 'shipped':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'delivered':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'cancelled':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      default:
        return 'bg-midnight-800/50 border-midnight-700 text-midnight-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✓';
      case 'processing':
        return '⚙️';
      case 'shipped':
        return '📦';
      case 'delivered':
        return '✓';
      case 'cancelled':
        return '✕';
      default:
        return '•';
    }
  };

  const statuses = ['confirmed', 'processing', 'shipped', 'delivered'];

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-midnight-800 rounded w-1/3 mb-8"></div>
            <div className="card-glass p-6 border border-sapphire-500/20">
              <div className="h-40 bg-midnight-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-8">Order Tracking</h1>
          <div className="card-glass p-12 border border-rose-500/20 text-center">
            <p className="text-rose-400 text-lg mb-6">{error}</p>
            <Link
              href="/gallery"
              className="inline-block px-8 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg hover:from-sapphire-700 hover:to-sapphire-800 transition-all font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-white mb-2">Order Tracking</h1>
        <p className="text-midnight-400 mb-8">Order #{orderData.orderNumber}</p>

        {/* Order Status */}
        <div className="card-glass p-6 border border-sapphire-500/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Order Status</h2>

          {/* Current Status */}
          <div
            className={`border rounded-lg p-6 mb-6 ${getStatusColor(
              orderData.status
            )}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getStatusIcon(orderData.status)}</span>
              <div>
                <p className="text-sm opacity-75">Current Status</p>
                <p className="text-xl font-bold capitalize">{orderData.status}</p>
              </div>
            </div>
            <p className="text-sm opacity-75">
              Last updated: {new Date(orderData.updatedAt).toLocaleString()}
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {statuses.map((status, index) => (
              <div key={status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      statuses.indexOf(orderData.status) >= index
                        ? 'bg-emerald-500 text-white'
                        : 'bg-midnight-800 text-midnight-500'
                    }`}
                  >
                    {statuses.indexOf(orderData.status) > index ? '✓' : index + 1}
                  </div>
                  {index < statuses.length - 1 && (
                    <div
                      className={`w-1 h-12 mt-1 ${
                        statuses.indexOf(orderData.status) > index
                          ? 'bg-emerald-500'
                          : 'bg-midnight-800'
                      }`}
                    ></div>
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold capitalize">{status}</p>
                  <p className="text-midnight-400 text-sm">
                    {statuses.indexOf(orderData.status) >= index
                      ? 'Completed'
                      : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tracking Information */}
        {orderData.delivery && (
          <div className="card-glass p-6 border border-sapphire-500/20 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Tracking Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-midnight-400">Carrier</span>
                <span className="text-white font-semibold">{orderData.delivery.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-midnight-400">Tracking Number</span>
                <span className="text-white font-mono font-semibold">
                  {orderData.delivery.trackingNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-midnight-400">Shipping Method</span>
                <span className="text-white font-semibold">{orderData.delivery.shippingMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-midnight-400">Estimated Delivery</span>
                <span className="text-white font-semibold">
                  {orderData.delivery.estimatedDelivery
                    ? new Date(orderData.delivery.estimatedDelivery).toLocaleDateString()
                    : 'Calculating...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Items */}
          <div className="card-glass p-6 border border-sapphire-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Items</h2>
            <div className="space-y-3">
              {orderData.items.map((item: any) => (
                <div key={item.id} className="flex justify-between pb-3 border-b border-midnight-700">
                  <div>
                    <p className="text-white font-semibold">{item.title}</p>
                    <p className="text-midnight-400 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sapphire-400 font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="card-glass p-6 border border-sapphire-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-3 pb-4 border-b border-midnight-700 mb-4">
              <div className="flex justify-between text-midnight-300">
                <span>Subtotal</span>
                <span>${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-midnight-300">
                <span>Tax (8%)</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-midnight-300">
                <span>Shipping</span>
                <span>{orderData.shipping === 0 ? 'FREE' : `$${orderData.shipping.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-white font-bold">Total</span>
              <span className="text-emerald-400 font-bold">${orderData.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card-glass p-6 border border-sapphire-500/20">
            <h2 className="text-xl font-bold text-white mb-4">📍 Shipping Address</h2>
            <p className="text-midnight-300">
              {orderData.address}<br />
              {orderData.city}, {orderData.state} {orderData.postalCode}<br />
              {orderData.country}
            </p>
          </div>

          {/* Contact Information */}
          <div className="card-glass p-6 border border-sapphire-500/20">
            <h2 className="text-xl font-bold text-white mb-4">📧 Contact Information</h2>
            <p className="text-midnight-300">
              <strong className="text-white">{orderData.customerName}</strong><br />
              {orderData.customerEmail}<br />
              {orderData.customerPhone && <>{orderData.customerPhone}</>}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <Link
            href="/gallery"
            className="inline-block px-8 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg hover:from-sapphire-700 hover:to-sapphire-800 transition-all font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
