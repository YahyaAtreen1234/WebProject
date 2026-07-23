import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    {
      question: 'What is your return policy?',
      answer: 'We offer a 15-day money back guarantee on all purchases. If you\'re not satisfied, simply contact us for a full refund.',
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes! We offer worldwide free shipping on all orders. Delivery times vary by location, typically 5-15 business days.',
    },
    {
      question: 'How do I track my order?',
      answer: 'You can track your order using the tracking number sent to your email. Visit our Track Order page for more details.',
    },
    {
      question: 'Are your minerals authentic?',
      answer: 'Yes, all our minerals are 100% authentic and come with certificates of authenticity. Each piece is carefully sourced and verified.',
    },
    {
      question: 'Do you offer bulk orders?',
      answer: 'Yes! We offer special pricing for bulk orders. Contact us at info@stonesland.com for custom quotes.',
    },
    {
      question: 'Can I cancel my order?',
      answer: 'Orders can be cancelled within 24 hours of placement. After that, the order enters the fulfillment process and cannot be cancelled.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Find answers to common questions about our products and services</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition">
                <h3 className="text-lg font-bold mb-3 text-black">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-gray-100 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Didn't find your answer?</h3>
            <p className="text-gray-600 mb-6">Contact our support team for personalized assistance.</p>
            <Link href="/contact" className="inline-block bg-black text-white font-bold px-8 py-3 rounded hover:bg-gray-800">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
