'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface ConfirmedOrder {
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
  }>;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const { clearCart } = useCart();
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      if (!sessionId || !orderId) {
        setError('The payment confirmation link is incomplete.');
        setLoading(false);
        return;
      }

      setError('');
      setLoading(true);
      try {
        const response = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, orderId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not verify this payment.');
        if (cancelled) return;

        setOrder(data.order);
        setPaymentConfirmed(data.paid === true);
        if (data.paid === true) clearCart();
      } catch (verificationError) {
        if (!cancelled) {
          setError(
            verificationError instanceof Error
              ? verificationError.message
              : 'Could not verify this payment.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    verifyPayment();
    return () => {
      cancelled = true;
    };
  }, [sessionId, orderId, retry, clearCart]);

  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="card-glass p-6 sm:p-12 border border-emerald-500/20 text-center">
          {loading ? (
            <p className="text-midnight-300" role="status">Verifying your payment...</p>
          ) : paymentConfirmed && order ? (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                  <span className="text-4xl text-emerald-400" aria-hidden="true">✓</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
                  Order Confirmed!
                </h1>
                <p className="text-midnight-400">Your payment was verified successfully.</p>
              </div>

              <div className="bg-midnight-800/50 p-6 rounded-lg mb-6 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-midnight-400 text-sm">Order Number</p>
                    <p className="text-white font-bold text-lg break-words">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-midnight-400 text-sm">Order Date</p>
                    <p className="text-white font-bold text-lg">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-midnight-400 text-sm">Total Amount</p>
                    <p className="text-emerald-400 font-bold text-lg">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-midnight-400 text-sm">Status</p>
                    <p className="text-sapphire-400 font-bold text-lg capitalize">{order.status}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-midnight-700">
                  <h2 className="text-white font-bold mb-4">Items Ordered</h2>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-4 text-midnight-300">
                        <span className="break-words">{item.title} × {item.quantity}</span>
                        <span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
                Payment Not Yet Confirmed
              </h1>
              <p className="text-midnight-300 mb-4">
                We have not received final confirmation from the payment provider. Your cart has been kept,
                and we have not marked the order as paid.
              </p>
              {order && (
                <p className="text-midnight-400 mb-4">
                  Order reference: <span className="font-mono text-white">{order.orderNumber}</span>
                </p>
              )}
              {error && <p className="text-rose-400 mb-6" role="alert">{error}</p>}
              <p className="text-sm text-midnight-400 mb-6">
                If your bank or wallet shows a charge, do not pay again; contact the store with your order reference.
              </p>
              {sessionId && orderId && (
                <button
                  type="button"
                  onClick={() => setRetry((value) => value + 1)}
                  className="mb-6 rounded-lg bg-sapphire-600 px-6 py-3 font-semibold text-white hover:bg-sapphire-700"
                >
                  Retry payment verification
                </button>
              )}
            </>
          )}

          {paymentConfirmed && (
            <div className="bg-sapphire-500/10 border border-sapphire-500/30 rounded-lg p-4 mb-6">
              <p className="text-sapphire-400 text-sm">
                A confirmation email will be sent to the address provided at checkout.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
            <Link
              href="/shop"
              className="flex-1 px-6 py-3 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg transition-colors font-semibold"
            >
              Continue Shopping
            </Link>
            {!paymentConfirmed && (
              <Link
                href="/cart"
                className="flex-1 px-6 py-3 bg-midnight-800 hover:bg-midnight-700 text-white rounded-lg transition-colors font-semibold"
              >
                Return to Cart
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-midnight-950" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
