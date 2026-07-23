'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function WeBuyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    itemDescription: '',
    quantity: '',
    condition: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buy request submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', itemDescription: '', quantity: '', condition: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">We Buy Gemstones & Minerals</h1>
          <p className="text-xl text-gray-600">Sell your precious gemstones and mineral collections to us</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Sell Your Collection</h2>
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
                <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Item Description *</label>
                <textarea
                  name="itemDescription"
                  value={formData.itemDescription}
                  onChange={handleChange}
                  placeholder="Describe the gemstone(s) or mineral(s) you want to sell..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Condition *</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-black"
                    required
                  >
                    <option value="">Select condition</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="worn">Worn</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition"
              >
                Submit Sell Request
              </button>

              {submitted && (
                <p className="text-green-600 font-semibold text-center">✓ Request submitted! We'll review and contact you with an offer.</p>
              )}
            </form>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Why Sell to Us?</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-3">
                <li>Fair market value for your collection</li>
                <li>Quick evaluation and offer process</li>
                <li>Secure payment options</li>
                <li>Expertise in gemstone valuation</li>
                <li>No hassle, straightforward process</li>
                <li>We buy collections of all sizes</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">What We Buy</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-3">
                <li>Loose gemstones</li>
                <li>Raw mineral specimens</li>
                <li>Polished stones</li>
                <li>Crystal collections</li>
                <li>Certified rare minerals</li>
                <li>Estate gemstone collections</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-bold mb-2">Fast & Secure</h3>
              <p className="text-gray-700">We evaluate items quickly and offer competitive prices. Secure shipping and payment guaranteed.</p>
              <Link
                href="/contact"
                className="inline-block bg-black text-white font-bold px-6 py-2 rounded hover:bg-gray-800 mt-4"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="font-bold mb-2">Submit Details</h3>
              <p className="text-gray-700">Tell us about your items</p>
            </div>
            <div className="text-center">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="font-bold mb-2">Evaluation</h3>
              <p className="text-gray-700">We assess and evaluate</p>
            </div>
            <div className="text-center">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="font-bold mb-2">Fair Offer</h3>
              <p className="text-gray-700">Receive market price offer</p>
            </div>
            <div className="text-center">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="font-bold mb-2">Get Paid</h3>
              <p className="text-gray-700">Secure payment upon arrival</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
