'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const { clearCart } = useCart();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear cart after successful payment
    clearCart();

    // Fetch order details
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, clearCart]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderData(data);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="card-glass p-12 border border-emerald-500/20 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-midnight-400">Thank you for your purchase</p>
          </div>

          {/* Order Details */}
          {orderData ? (
            <div className="bg-midnight-800/50 p-6 rounded-lg mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-midnight-400 text-sm">Order Number</p>
                  <p className="text-white font-bold text-lg">{orderData.orderNumber}</p>
                </div>
                <div>
                  <p className="text-midnight-400 text-sm">Order Date</p>
                  <p className="text-white font-bold text-lg">
                    {new Date(orderData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-midnight-400 text-sm">Total Amount</p>
                  <p className="text-emerald-400 font-bold text-lg">${orderData.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-midnight-400 text-sm">Status</p>
                  <p className="text-sapphire-400 font-bold text-lg capitalize">{orderData.status}</p>
                </div>
              </div>

              {/* Items */}
              <div className="mt-6 pt-6 border-t border-midnight-700">
                <h3 className="text-white font-bold mb-4">Items Ordered</h3>
                <div className="space-y-2">
                  {orderData.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-midnight-300">
                      <span>{item.title} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mt-6 pt-6 border-t border-midnight-700">
                <h3 className="text-white font-bold mb-2">Shipping Address</h3>
                <p className="text-midnight-300 text-sm">
                  {orderData.address}<br />
                  {orderData.city}, {orderData.postalCode}<br />
                  {orderData.country}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-midnight-800/50 p-6 rounded-lg mb-6 animate-pulse">
              <p className="text-midnight-400">Loading order details...</p>
            </div>
          )}

          {/* Message */}
          <div className="bg-sapphire-500/10 border border-sapphire-500/30 rounded-lg p-4 mb-6">
            <p className="text-sapphire-400 text-sm">
              A confirmation email has been sent to your inbox. You will receive a shipping notification with tracking information within 24 hours.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
            {orderData && (
              <Link
                href={`/orders/${orderData.orderNumber}`}
                className="flex-1 px-6 py-3 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg transition-colors font-semibold"
              >
                Track Order
              </Link>
            )}
            <Link
              href="/gallery"
              className="flex-1 px-6 py-3 bg-midnight-800 hover:bg-midnight-700 text-white rounded-lg transition-colors font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
