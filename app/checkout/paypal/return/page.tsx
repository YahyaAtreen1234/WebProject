'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function PayPalReturnContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const paypalOrderId = searchParams.get('token');
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const confirmPayment = async () => {
      if (!orderId || !paypalOrderId) {
        setError('PayPal did not return the order details needed for verification.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/paypal/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, paypalOrderId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'PayPal payment could not be verified.');
        if (cancelled) return;

        setOrderNumber(data.orderNumber);
        clearCart();
      } catch (verificationError) {
        if (!cancelled) {
          setError(
            verificationError instanceof Error
              ? verificationError.message
              : 'PayPal payment could not be verified.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    confirmPayment();
    return () => {
      cancelled = true;
    };
  }, [orderId, paypalOrderId, retry, clearCart]);

  return (
    <div className="min-h-screen bg-midnight-950 px-4 py-12">
      <div className="card-glass mx-auto max-w-xl rounded-2xl p-6 text-center sm:p-10">
        {loading ? (
          <p className="text-midnight-200" role="status">Confirming your PayPal payment...</p>
        ) : orderNumber ? (
          <>
            <h1 className="mb-4 text-3xl font-bold text-white">Payment Confirmed</h1>
            <p className="mb-6 text-midnight-200">
              Your order <span className="font-mono text-emerald-400">{orderNumber}</span> is confirmed.
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-4 text-3xl font-bold text-white">Payment Confirmation Pending</h1>
            <p className="mb-4 text-midnight-300">
              We have not yet confirmed payment with PayPal. Do not submit another payment.
            </p>
            {error && <p className="mb-6 text-rose-400" role="alert">{error}</p>}
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mb-4 rounded-lg bg-sapphire-600 px-6 py-3 font-semibold text-white hover:bg-sapphire-700"
            >
              Retry payment verification
            </button>
          </>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="rounded-lg bg-midnight-800 px-6 py-3 font-semibold text-white hover:bg-midnight-700"
          >
            Continue Shopping
          </Link>
          {!orderNumber && (
            <Link
              href="/cart"
              className="rounded-lg bg-midnight-800 px-6 py-3 font-semibold text-white hover:bg-midnight-700"
            >
              Return to Cart
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PayPalReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-midnight-950" />}>
      <PayPalReturnContent />
    </Suspense>
  );
}
