'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  user: { name: string };
  createdAt: string;
  helpful: number;
}

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
}

export default function ProductReviews({ productId, productTitle }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
        if (data.length > 0) {
          const avg = data.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.length;
          setAverageRating(avg);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ rating: 5, title: '', comment: '' });
        setShowForm(false);
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= Math.round(rating) ? 'text-gold-400' : 'text-midnight-600'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <p className="text-midnight-400">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Customer Reviews</h3>
          {reviews.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-gold-400">{averageRating.toFixed(1)}</div>
                <div>
                  {renderStars(averageRating)}
                  <p className="text-sm text-midnight-400 mt-1">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-500 font-semibold transition-all whitespace-nowrap"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="card-glass border border-sapphire-500/20 p-6 rounded-lg">
          <h4 className="text-lg font-bold text-white mb-4">Share Your Thoughts</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`text-3xl transition-all ${
                      star <= formData.rating ? 'text-gold-400 scale-110' : 'text-midnight-600'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Review Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-400 outline-none transition-colors"
                placeholder="Excellent quality!"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Your Review</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full px-4 py-2 bg-midnight-800 border border-sapphire-500/30 rounded-lg text-white placeholder-midnight-500 focus:border-sapphire-400 outline-none transition-colors resize-none"
                placeholder="Share your experience with this product..."
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-semibold disabled:opacity-50 transition-all"
              >
                {submitting ? 'Posting...' : 'Post Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-midnight-800 text-midnight-300 rounded-lg hover:bg-midnight-700 font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="card-glass border border-midnight-700 p-8 text-center rounded-lg">
          <p className="text-midnight-400">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card-glass border border-sapphire-500/20 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-midnight-400 font-semibold">{review.rating}.0</span>
                  </div>
                  <h5 className="text-lg font-bold text-white">{review.title}</h5>
                  <p className="text-sm text-midnight-400">by {review.user.name}</p>
                </div>
                <span className="text-xs text-midnight-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-midnight-200 mb-4">{review.comment}</p>

              <button className="text-sm text-sapphire-400 hover:text-sapphire-300 transition-colors">
                👍 Helpful ({review.helpful})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
