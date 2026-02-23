'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Percent, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface ApiOffer {
  id: string | number;
  title: string;
  description: string;
  discount: number;
  discount_type: 'percentage' | 'fixed';
  start_date: string;
  end_date: string;
  is_active: boolean;
  category: string;
}

export default function OffersBanner() {
  const [offers, setOffers] = useState<ApiOffer[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>({});
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await apiClient.getOffers();
        const normalizeDate = (value?: string | null) => {
          if (!value) return '';
          const text = String(value);
          return text.includes('T') ? text.split('T')[0] : text;
        };

        const normalizeOffer = (raw: any): ApiOffer => ({
          id: raw?.id ?? '',
          title: raw?.title ?? '',
          description: raw?.description ?? '',
          discount:
            typeof raw?.discount_percent === 'number'
              ? raw.discount_percent
              : typeof raw?.discount === 'number'
              ? raw.discount
              : 0,
          discount_type: raw?.discount_type === 'fixed' ? 'fixed' : 'percentage',
          start_date: normalizeDate(raw?.valid_from ?? raw?.start_date),
          end_date: normalizeDate(raw?.valid_until ?? raw?.end_date),
          is_active: typeof raw?.is_active === 'boolean' ? raw.is_active : true,
          category: raw?.category ?? 'general',
        });

        setOffers(Array.isArray(data) ? data.map(normalizeOffer) : []);
      } catch {
        setOffers([]);
      }
    };
    fetchOffers();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeOffers = offers.filter((o) => {
    if (!o.is_active) return false;
    if (o.start_date && o.end_date) {
      return o.start_date <= todayStr && todayStr <= o.end_date;
    }
    return true;
  });
  const visibleOffers = activeOffers.filter((offer) => !dismissedIds[String(offer.id)]);

  if (visibleOffers.length === 0) {
    return null;
  }

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
    <div className="absolute inset-x-0 top-20 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pointer-events-auto">
        <div className="grid gap-3">
          <AnimatePresence initial={false}>
            {visibleOffers.map((offer) => {
              const isExpanded = expandedIds[String(offer.id)] ?? false;
              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-2xl border border-red-200/60 dark:border-red-500/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-500/5 to-transparent pointer-events-none" />
                  <div className="relative flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-200">
                        <Percent className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {offer.title} · {offer.discount}% OFF
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{offer.category}</p>
                      </div>
                    </div>

                    <div className="flex-1 text-sm text-gray-700 dark:text-gray-200">
                      {isExpanded ? offer.description : `${offer.description.slice(0, 80)}${offer.description.length > 80 ? '…' : ''}`}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {offer.end_date ? `Valid until ${formatDate(offer.end_date)}` : 'Limited time'}
                        </span>
                        {offer.end_date && isOfferExpiringSoon(offer.end_date) && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200 px-2 py-0.5 text-[10px] font-medium">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Expires Soon
                          </span>
                        )}
                      </div>
                      <Link
                        href="/book"
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200"
                      >
                        Book Now
                      </Link>
                      <button
                        onClick={() =>
                          setExpandedIds((prev) => ({
                            ...prev,
                            [String(offer.id)]: !isExpanded,
                          }))
                        }
                        className="inline-flex items-center text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-200"
                        aria-label={isExpanded ? 'Collapse offer' : 'Expand offer'}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Collapse
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Expand
                          </>
                        )}
                      </button>
                      <button
                        onClick={() =>
                          setDismissedIds((prev) => ({
                            ...prev,
                            [String(offer.id)]: true,
                          }))
                        }
                        className="inline-flex items-center text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-300 transition-colors duration-200"
                        aria-label="Dismiss offer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
