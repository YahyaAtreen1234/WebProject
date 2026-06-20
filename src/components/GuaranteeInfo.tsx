'use client';

import { useState, useEffect } from 'react';

interface GuaranteePolicy {
  id: string;
  title: string;
  description: string;
  days: number;
  terms: string;
  conditionsJson: string;
}

export default function GuaranteeInfo() {
  const [policies, setPolicies] = useState<GuaranteePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/guarantee');
      if (response.ok) {
        const data = await response.json();
        setPolicies(data);
      }
    } catch (error) {
      console.error('Failed to fetch guarantee policies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-midnight-300">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Guarantee Badge/Header */}
      <div className="card-glass p-8 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">✓</div>
          <div>
            <h2 className="text-3xl font-bold text-emerald-400">
              100% Money-Back Guarantee
            </h2>
            <p className="text-midnight-300 mt-1">
              We stand behind every purchase with our satisfaction guarantee
            </p>
          </div>
        </div>
      </div>

      {/* Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.length > 0 ? (
          policies.map((policy) => {
            let conditions: string[] = [];
            try {
              conditions = JSON.parse(policy.conditionsJson);
            } catch {
              conditions = [];
            }

            return (
              <div
                key={policy.id}
                className="card-glass p-6 border border-sapphire-500/20 hover:border-sapphire-500/50"
              >
                <h3 className="text-xl font-bold text-white mb-2">{policy.title}</h3>
                <p className="text-emerald-400 font-semibold mb-3">
                  {policy.days}-Day Money-Back Guarantee
                </p>

                <p className="text-midnight-300 mb-4">{policy.description}</p>

                {policy.terms && (
                  <div className="bg-midnight-800/50 p-4 rounded mb-4 border border-midnight-700">
                    <p className="text-sm text-midnight-300">{policy.terms}</p>
                  </div>
                )}

                {conditions.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-2">Conditions:</p>
                    <ul className="space-y-1">
                      {conditions.map((condition, index) => (
                        <li key={index} className="text-sm text-midnight-300 flex items-start gap-2">
                          <span className="text-emerald-400">•</span>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-midnight-300">
            <p>Our standard guarantee applies to all purchases.</p>
            <p className="text-sm mt-2">
              No questions asked within 30 days of purchase.
            </p>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="card-glass p-6 border border-sapphire-500/20">
        <h3 className="text-2xl font-bold text-white mb-6">How Our Guarantee Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-sapphire-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-sapphire-400">1</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Make a Purchase</h4>
            <p className="text-sm text-midnight-300">
              Order any product with confidence
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-sapphire-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-sapphire-400">2</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Try It Out</h4>
            <p className="text-sm text-midnight-300">
              Use and enjoy your product
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-sapphire-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-sapphire-400">3</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Request Refund</h4>
            <p className="text-sm text-midnight-300">
              Contact us within the guarantee period
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-sapphire-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-sapphire-400">4</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Get Refunded</h4>
            <p className="text-sm text-midnight-300">
              Full refund to your original payment method
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card-glass p-6 border border-sapphire-500/20">
        <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-semibold mb-2">
              What if I'm not completely satisfied?
            </h4>
            <p className="text-midnight-300">
              We offer a full refund within 30 days of purchase, no questions asked.
              Simply contact our support team.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">
              How long do I have to return my purchase?
            </h4>
            <p className="text-midnight-300">
              You have 30 days from the date of purchase to request a refund under
              our money-back guarantee.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">
              Do I need to return the item?
            </h4>
            <p className="text-midnight-300">
              Contact our support team for return instructions. Some items may not
              require physical return.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">
              How long does the refund take?
            </h4>
            <p className="text-midnight-300">
              Refunds are typically processed within 5-10 business days after we
              receive your return.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}