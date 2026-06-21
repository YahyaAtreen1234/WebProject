import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CheckoutCancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="card-glass p-12 border border-rose-500/20 text-center">
          {/* Cancel Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500/20 rounded-full mb-4">
              <span className="text-4xl">✕</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Payment Cancelled</h1>
            <p className="text-midnight-400">Your payment was not completed</p>
          </div>

          {/* Message */}
          <div className="bg-midnight-800/50 p-6 rounded-lg mb-6">
            <p className="text-midnight-300 mb-4">
              No charges have been made to your account. You can try again whenever you're ready.
            </p>
            {orderId && (
              <p className="text-midnight-400 text-sm">
                Your cart has been saved. Order ID: <span className="text-sapphire-400 font-mono">{orderId}</span>
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-sapphire-500/10 border border-sapphire-500/30 rounded-lg p-4 mb-6">
            <p className="text-sapphire-400 text-sm">
              💡 You can return to your cart anytime to review and complete your purchase.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
            <Link
              href="/cart"
              className="flex-1 px-6 py-3 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg transition-colors font-semibold"
            >
              Return to Cart
            </Link>
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

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-midnight-950" />}>
      <CheckoutCancelContent />
    </Suspense>
  );
}
