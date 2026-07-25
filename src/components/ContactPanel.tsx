'use client';

import { useState } from 'react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'new' | 'read' | 'responded';
  type: 'general' | 'support' | 'sales' | 'feedback';
}

interface ContactInfo {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

export default function ContactPanel() {
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    type: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Order Inquiry',
      message: 'I have a question about my recent order...',
      date: '2026-06-15',
      status: 'responded',
      type: 'support',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      subject: 'Product Feedback',
      message: 'Great quality gemstones! Would love to see more varieties...',
      date: '2026-06-14',
      status: 'read',
      type: 'feedback',
    },
  ]);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const contactInfo: ContactInfo[] = [
    {
      title: 'Email Address',
      value: 'support@stonesland.com',
      icon: '📧',
      color: 'sapphire',
    },
    {
      title: 'Phone Number',
      value: '+1 (800) STONES-1',
      icon: '📞',
      color: 'emerald',
    },
    {
      title: 'Live Chat',
      value: 'Mon-Fri, 9AM-6PM EST',
      icon: '💬',
      color: 'amethyst',
    },
    {
      title: 'Address',
      value: '123 Gem Street, New York, NY 10001',
      icon: '📍',
      color: 'gold',
    },
  ];

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'What are your shipping times?',
      answer:
        'We offer standard shipping (5-7 business days) and express shipping (2-3 business days). All orders include tracking and insurance for valuable gemstones.',
      category: 'shipping',
      helpful: 45,
    },
    {
      id: '2',
      question: 'Do you offer international shipping?',
      answer:
        'Yes! We ship to over 150 countries worldwide. International orders may take 10-21 business days depending on destination and customs clearance.',
      category: 'shipping',
      helpful: 32,
    },
    {
      id: '3',
      question: 'What is your return policy?',
      answer:
        'We offer a 30-day money-back guarantee on all items. Items must be in original condition. Contact us for a return label.',
      category: 'returns',
      helpful: 58,
    },
    {
      id: '4',
      question: 'Are your gemstones authentic?',
      answer:
        'All our gemstones are 100% natural and certified by reputable gemological institutions. Each item comes with a certificate of authenticity.',
      category: 'products',
      helpful: 67,
    },
    {
      id: '5',
      question: 'How do I care for my gemstones?',
      answer:
        'Most gemstones are durable and long-lasting. We recommend gentle cleaning with lukewarm water and mild soap. Avoid extreme temperatures and harsh chemicals.',
      category: 'care',
      helpful: 41,
    },
    {
      id: '6',
      question: 'Can I customize orders?',
      answer:
        'Yes! We offer custom gemstone arrangements, settings, and bespoke designs. Contact our sales team at sales@stonesland.com for custom quotes.',
      category: 'orders',
      helpful: 29,
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call the API endpoint to save the message
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add new message to local list
      const newMessage: ContactMessage = {
        id: data.id || String(messages.length + 1),
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        date: new Date().toISOString().split('T')[0],
        status: 'new',
        type: (formData.type as any) || 'general',
      };
      setMessages([newMessage, ...messages]);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        type: 'general',
        message: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMsg);
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'read':
        return 'bg-sapphire-500/20 text-sapphire-400 border-sapphire-500/30';
      case 'new':
        return 'bg-gold-500/20 text-gold-400 border-gold-500/30';
      default:
        return 'bg-midnight-800 text-midnight-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'support':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'sales':
        return 'bg-amethyst-500/10 text-amethyst-400 border-amethyst-500/30';
      case 'feedback':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-sapphire-500/10 text-sapphire-400 border-sapphire-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-display font-bold text-white mb-3">Contact Us</h1>
          <p className="text-midnight-400 text-lg">
            Get in touch with our team. We're here to help!
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {contactInfo.map((info, idx) => (
            <div
              key={idx}
              className={`card-glass p-6 border-2 transition-all hover:scale-105 ${
                info.color === 'sapphire'
                  ? 'border-sapphire-500/30 hover:border-sapphire-500/60'
                  : info.color === 'emerald'
                  ? 'border-emerald-500/30 hover:border-emerald-500/60'
                  : info.color === 'amethyst'
                  ? 'border-amethyst-500/30 hover:border-amethyst-500/60'
                  : 'border-gold-500/30 hover:border-gold-500/60'
              }`}
            >
              <p className="text-3xl mb-3">{info.icon}</p>
              <p className="text-midnight-400 text-sm font-semibold">{info.title}</p>
              <p className="text-white font-bold mt-2">{info.value}</p>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-4 border-b border-sapphire-500/20">
            {[
              { id: 'contact', label: '✉️ Send Message', icon: '✉️' },
              { id: 'messages', label: '📨 My Messages', icon: '📨' },
              { id: 'faq', label: '❓ FAQ', icon: '❓' },
              { id: 'support', label: '🛟 Support Tickets', icon: '🛟' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-semibold whitespace-nowrap transition-all rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-sapphire-600 text-white'
                    : 'text-midnight-400 hover:text-white hover:bg-sapphire-500/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}

        {/* Contact Form Tab */}
        {activeTab === 'contact' && (
          <div className="card-glass p-8 border border-sapphire-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                <p className="text-emerald-400 font-semibold">
                  ✅ Message sent successfully! We'll get back to you soon.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 rounded-lg">
                <p className="text-rose-400 font-semibold">
                  ❌ {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Phone & Subject Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Contact Type */}
              <div>
                <label className="block text-white font-semibold mb-2">Contact Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 rounded-lg text-white focus:border-sapphire-500 focus:outline-none transition-colors"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Support Request</option>
                  <option value="sales">Sales Question</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-white font-semibold mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Tell us everything..."
                  rows={6}
                  className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-sapphire-600 to-sapphire-700 text-white rounded-lg hover:from-sapphire-700 hover:to-sapphire-800 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? '⏳' : '📤'}</span> {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-midnight-800/30 rounded-lg border border-midnight-700">
              <p className="text-midnight-300 text-sm">
                <strong>📌 Note:</strong> We typically respond to all inquiries within 24 hours during
                business days. For urgent matters, please call us at{' '}
                <span className="text-sapphire-400">+1 (800) STONES-1</span>
              </p>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="card-glass p-8 border border-sapphire-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">Your Messages ({messages.length})</h2>

            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-6 bg-midnight-800/30 rounded-lg border border-midnight-700 hover:border-sapphire-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-bold">{msg.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            msg.status
                          )}`}
                        >
                          {msg.status.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTypeColor(
                            msg.type
                          )}`}
                        >
                          {msg.type}
                        </span>
                      </div>
                      <p className="text-midnight-400 text-sm">{msg.email}</p>
                    </div>
                    <p className="text-midnight-400 text-sm">{msg.date}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-white font-semibold">{msg.subject}</p>
                    <p className="text-midnight-300 text-sm mt-2 line-clamp-2">{msg.message}</p>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-midnight-600">
                    <button className="text-sapphire-400 hover:text-sapphire-300 text-sm font-semibold">
                      View Details →
                    </button>
                    <button className="text-rose-400 hover:text-rose-300 text-sm font-semibold">
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-3xl mb-3">📭</p>
                  <p className="text-midnight-400">No messages yet. Send us one!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="card-glass p-8 border border-sapphire-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>

            <div className="space-y-3">
              {faqItems.map((item) => (
                <div key={item.id} className="border border-midnight-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === item.id ? null : item.id)
                    }
                    className="w-full p-4 bg-midnight-800/30 hover:bg-midnight-800/50 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left flex-1">
                      <p className="text-white font-semibold">{item.question}</p>
                      <p className="text-midnight-400 text-sm mt-1">
                        Category: {item.category.toUpperCase()}
                      </p>
                    </div>
                    <span className="text-2xl ml-4">
                      {expandedFAQ === item.id ? '−' : '+'}
                    </span>
                  </button>

                  {expandedFAQ === item.id && (
                    <div className="p-4 bg-midnight-900/50 border-t border-midnight-700">
                      <p className="text-midnight-200 mb-4">{item.answer}</p>
                      <div className="flex items-center gap-4 pt-4 border-t border-midnight-700">
                        <p className="text-midnight-400 text-sm">Was this helpful?</p>
                        <button className="text-sm text-sapphire-400 hover:text-sapphire-300">
                          👍 Yes ({item.helpful})
                        </button>
                        <button className="text-sm text-rose-400 hover:text-rose-300">
                          👎 No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* FAQ Categories */}
            <div className="mt-8 p-4 bg-midnight-800/30 rounded-lg border border-midnight-700">
              <p className="text-white font-semibold mb-3">Browse by Category:</p>
              <div className="flex flex-wrap gap-2">
                {['shipping', 'returns', 'products', 'care', 'orders'].map((cat) => (
                  <button
                    key={cat}
                    className="px-3 py-1 bg-sapphire-500/20 text-sapphire-400 rounded-full text-sm hover:bg-sapphire-500/30 transition-colors border border-sapphire-500/30"
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Support Tickets Tab */}
        {activeTab === 'support' && (
          <div className="card-glass p-8 border border-sapphire-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Support Tickets</h2>
              <button className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 transition-all font-semibold text-sm">
                + Create Ticket
              </button>
            </div>

            <div className="space-y-4">
              {/* Ticket 1 */}
              <div className="p-6 bg-midnight-800/30 rounded-lg border border-emerald-500/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">TKT-001234</h3>
                    <p className="text-midnight-400 text-sm">Order delivery delay</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/30">
                    RESOLVED
                  </span>
                </div>
                <p className="text-midnight-300 text-sm mb-3">
                  Created: June 10, 2026 • Updated: June 12, 2026
                </p>
                <button className="text-sapphire-400 hover:text-sapphire-300 text-sm font-semibold">
                  View Ticket →
                </button>
              </div>

              {/* Ticket 2 */}
              <div className="p-6 bg-midnight-800/30 rounded-lg border border-amethyst-500/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">TKT-001233</h3>
                    <p className="text-midnight-400 text-sm">Product quality concern</p>
                  </div>
                  <span className="px-3 py-1 bg-amethyst-500/20 text-amethyst-400 rounded-full text-xs font-semibold border border-amethyst-500/30">
                    IN PROGRESS
                  </span>
                </div>
                <p className="text-midnight-300 text-sm mb-3">
                  Created: June 13, 2026 • Updated: June 14, 2026
                </p>
                <button className="text-sapphire-400 hover:text-sapphire-300 text-sm font-semibold">
                  View Ticket →
                </button>
              </div>

              {/* Ticket 3 */}
              <div className="p-6 bg-midnight-800/30 rounded-lg border border-gold-500/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">TKT-001232</h3>
                    <p className="text-midnight-400 text-sm">Return request</p>
                  </div>
                  <span className="px-3 py-1 bg-gold-500/20 text-gold-400 rounded-full text-xs font-semibold border border-gold-500/30">
                    PENDING
                  </span>
                </div>
                <p className="text-midnight-300 text-sm mb-3">
                  Created: June 15, 2026 • Updated: June 15, 2026
                </p>
                <button className="text-sapphire-400 hover:text-sapphire-300 text-sm font-semibold">
                  View Ticket →
                </button>
              </div>
            </div>

            {/* Support Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-midnight-800/30 rounded-lg border border-midnight-700">
                <p className="text-midnight-400 text-sm">Total Tickets</p>
                <p className="text-3xl font-bold text-white mt-1">3</p>
              </div>
              <div className="p-4 bg-midnight-800/30 rounded-lg border border-emerald-500/20">
                <p className="text-midnight-400 text-sm">Resolved</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">1</p>
              </div>
              <div className="p-4 bg-midnight-800/30 rounded-lg border border-amethyst-500/20">
                <p className="text-midnight-400 text-sm">Open</p>
                <p className="text-3xl font-bold text-amethyst-400 mt-1">2</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
