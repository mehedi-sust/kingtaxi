'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Percent, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  isActive: boolean;
  category: string;
}

export default function OffersBanner() {
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Mock active offers - in real app, this would come from your API
  const activeOffers: Offer[] = [
    {
      id: 1,
      title: 'Summer Discount',
      description: 'Get 15% off on all rides during summer season',
      discount: 15,
      discountType: 'percentage',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      isActive: true,
      category: 'seasonal'
    },
    {
      id: 3,
      title: 'New Customer Welcome',
      description: '20% discount for first-time customers',
      discount: 20,
      discountType: 'percentage',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
      category: 'welcome'
    }
  ];

  // Auto-rotate offers every 5 seconds
  useEffect(() => {
    if (activeOffers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % activeOffers.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeOffers.length]);

  // Don't show banner if no active offers or user dismissed it
  if (activeOffers.length === 0 || !isVisible) {
    return null;
  }

  const currentOffer = activeOffers[currentOfferIndex];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isOfferExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentOffer.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center space-x-4"
                  >
                    {/* Offer Icon */}
                    <div className="flex-shrink-0">
                      <div className="bg-white/20 rounded-full p-2">
                        <Percent className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Offer Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-bold text-lg">
                            {currentOffer.title} - {currentOffer.discount}
                            {currentOffer.discountType === 'percentage' ? '%' : '£'} OFF
                          </p>
                          <p className="text-red-100 text-sm">
                            {currentOffer.description}
                          </p>
                        </div>

                        {/* Validity */}
                        <div className="flex items-center text-red-100 text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Valid until {formatDate(currentOffer.endDate)}</span>
                          {isOfferExpiringSoon(currentOffer.endDate) && (
                            <span className="ml-2 bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Expires Soon!
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        <Link
                          href="/book"
                          className="bg-white text-red-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 whitespace-nowrap"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Offer Indicators */}
              {activeOffers.length > 1 && (
                <div className="flex space-x-2 mx-4">
                  {activeOffers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentOfferIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === currentOfferIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 text-red-100 hover:text-white transition-colors duration-200 p-1"
                aria-label="Close banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="block sm:hidden">
            <div className="px-4 pb-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentOffer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <p className="font-bold text-lg mb-1">
                    {currentOffer.title} - {currentOffer.discount}
                    {currentOffer.discountType === 'percentage' ? '%' : '£'} OFF
                  </p>
                  <p className="text-red-100 text-sm mb-3">
                    {currentOffer.description}
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-red-100 text-xs">
                      Valid until {formatDate(currentOffer.endDate)}
                    </span>
                    <Link
                      href="/book"
                      className="bg-white text-red-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200"
                    >
                      Book Now
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
