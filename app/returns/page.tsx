import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Returns & Refunds</h1>
          <p className="text-xl text-gray-600">15-day money back guarantee on all purchases</p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">💰 Money Back Guarantee</h3>
            <p className="text-gray-700">
              We're confident you'll love your purchase. If you're not completely satisfied for any reason, we offer a 15-day money back guarantee with no questions asked.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">📋 How to Return</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-3">
              <li>Contact us at info@stonesland.com with your order number</li>
              <li>We'll provide you with a prepaid return shipping label</li>
              <li>Ship the item back in its original condition</li>
              <li>Once received and inspected, we'll process your refund</li>
              <li>Refunds are processed within 5-7 business days</li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">✅ Return Conditions</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Item must be in original condition</li>
              <li>Must be returned within 15 days of purchase</li>
              <li>Original packaging required (when possible)</li>
              <li>No return shipping costs for defective items</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">❓ Have Questions?</h3>
            <p className="text-gray-700 mb-4">Our customer support team is here to help with any return or refund questions.</p>
            <Link href="/contact" className="inline-block bg-black text-white font-bold px-6 py-2 rounded hover:bg-gray-800">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
