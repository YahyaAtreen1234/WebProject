'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function CustomOrderPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gemstoneType: '',
    specifications: '',
    budget: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Custom order submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', gemstoneType: '', specifications: '', budget: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Make a Custom Order</h1>
          <p className="text-xl text-gray-600">Design your perfect gemstone or mineral specimen</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Tell Us Your Vision</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Gemstone Type *</label>
                <select
                  name="gemstoneType"
                  value={formData.gemstoneType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-black"
                  required
                >
                  <option value="">Select a gemstone</option>
                  <option value="amethyst">Amethyst</option>
                  <option value="emerald">Emerald</option>
                  <option value="ruby">Ruby</option>
                  <option value="sapphire">Sapphire</option>
                  <option value="tourmaline">Tourmaline</option>
                  <option value="quartz">Quartz</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Specifications *</label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  placeholder="Describe size, color, quality, and any special requirements..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Budget Range (USD)</label>
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g., $1000 - $5000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition"
              >
                Submit Custom Order Request
              </button>

              {submitted && (
                <p className="text-green-600 font-semibold text-center">✓ Request submitted successfully! We'll contact you soon.</p>
              )}
            </form>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">How It Works</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-3">
                <li>Submit your custom order request with specifications</li>
                <li>Our experts review your requirements</li>
                <li>We provide a quote and timeline</li>
                <li>Approve and we source your gemstone</li>
                <li>Receive your custom specimen</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3">Why Choose Custom Orders?</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Get exactly what you're looking for</li>
                <li>Personalized sourcing from our network</li>
                <li>Competitive pricing</li>
                <li>Expert quality assurance</li>
                <li>Certificate of authenticity included</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-gray-700 mb-4">Have questions about custom orders? Contact our team:</p>
              <Link
                href="/contact"
                className="inline-block bg-black text-white font-bold px-6 py-2 rounded hover:bg-gray-800"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
