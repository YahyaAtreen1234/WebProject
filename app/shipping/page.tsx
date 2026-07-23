import Link from 'next/link';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
          <p className="text-xl text-gray-600">Fast, secure delivery to your doorstep</p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">🌍 Worldwide Free Shipping</h3>
            <p className="text-gray-700 mb-4">We offer free shipping on all orders worldwide, regardless of order value.</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Standard Shipping: 5-15 business days</li>
              <li>Express Shipping: 2-5 business days (available for select regions)</li>
              <li>All packages include tracking</li>
              <li>Full insurance coverage on all shipments</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">📦 Secure Packaging</h3>
            <p className="text-gray-700">
              Each mineral is carefully packaged with protective materials to ensure safe arrival. All packages are insured against loss or damage.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">🚚 Delivery Status</h3>
            <p className="text-gray-700 mb-4">Track your order in real-time using the tracking number provided in your shipping confirmation email.</p>
            <Link href="/tracking" className="inline-block bg-black text-white font-bold px-6 py-2 rounded hover:bg-gray-800">
              Track Your Order
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
