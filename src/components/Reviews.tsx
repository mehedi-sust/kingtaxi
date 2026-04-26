'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.getPublicFeedback();
        if (cancelled) return;
        setReviews(Array.isArray(data) ? data : []);
      } catch {
        if (cancelled) return;
        setReviews([]);
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const averageRating = useMemo(() => {
    if (!reviews.length) return null;
    const values = reviews
      .map((item) => Number(item?.rating ?? NaN))
      .filter((value) => Number.isFinite(value) && value > 0 && value <= 5);
    if (!values.length) return null;
    return values.reduce((acc, cur) => acc + cur, 0) / values.length;
  }, [reviews]);

  const stats = [
    { number: '10+', label: 'Years of Service' },
    { number: '50,000+', label: 'Happy Customers' },
    { number: averageRating ? `${averageRating.toFixed(1)}/5` : 'N/A', label: 'Average Rating' },
    { number: '24/7', label: 'Service Available' },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Customer Reviews
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Trusted by thousands of customers in Ashford and Kent
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-red-600 mb-1">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Reviews Grid */}
        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Customer reviews will appear here once published.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {reviews.slice(0, 3).map((review, index) => {
              const name = String(review?.customer_name || review?.name || 'Verified Customer');
              const rating = Number(review?.rating ?? 0);
              const comment = String(review?.comment || '').trim();
              const initials = name
                .split(' ')
                .map((n) => n[0])
                .filter(Boolean)
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <motion.div
                  key={String(review?.id || index)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {initials || 'KC'}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{name}</h4>
                      <div className="flex space-x-0.5">
                        {renderStars(Math.max(0, Math.min(5, rating)))}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    &ldquo;{comment || 'Excellent service.'}&rdquo;
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Book Your Ashford Taxi Today
            </h3>
            <p className="text-red-100 mb-6 max-w-xl mx-auto text-base">
              Join thousands of satisfied customers. Experience reliable taxi service in Ashford and Kent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/book"
                className="bg-white text-red-600 px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg inline-block"
              >
                Book Online Now
              </a>
              <a
                href="tel:+4401233367357"
                className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 rounded-lg text-base font-semibold transition-all duration-200 inline-block"
              >
                Call: 01233 367 357
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
