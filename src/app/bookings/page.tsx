'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Star, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';

type Booking = {
  id: string | number;
  pickup_address: string;
  dropoff_address: string;
  pickup_time: string;
  vehicle_type?: string | null;
  status?: string | null;
  estimated_fare?: number | null;
  confirmed_fare?: number | null;
  created_at?: string | null;
};

type FeedbackEntry = {
  id: string;
  booking_id: string;
  rating: number;
  comment?: string;
  is_public?: boolean;
};

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myFeedback, setMyFeedback] = useState<Record<string, FeedbackEntry>>({});
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
  const [feedbackSubmittingId, setFeedbackSubmittingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const at = Date.parse(a.pickup_time || a.created_at || '');
      const bt = Date.parse(b.pickup_time || b.created_at || '');
      return bt - at;
    });
  }, [bookings]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/signin');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [bookingsData, feedbackData] = await Promise.all([
          apiClient.getMyBookings(),
          apiClient.getMyFeedback().catch(() => []),
        ]);
        setBookings(Array.isArray(bookingsData) ? (bookingsData as Booking[]) : []);
        const feedbackMap = new Map<string, FeedbackEntry>();
        const feedbackList = Array.isArray(feedbackData) ? feedbackData : [];
        feedbackList.forEach((item: any) => {
          const bookingId = String(item?.booking_id || '');
          if (!bookingId) return;
          feedbackMap.set(bookingId, {
            id: String(item?.id || item?.feedback_id || bookingId),
            booking_id: bookingId,
            rating: Number(item?.rating ?? 0),
            comment: typeof item?.comment === 'string' ? item.comment : '',
            is_public: Boolean(item?.is_public),
          });
        });
        setMyFeedback(Object.fromEntries(feedbackMap.entries()));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load bookings');
        setBookings([]);
        setMyFeedback({});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, isLoading]);

  const cancelBooking = async (bookingId: string | number) => {
    try {
      setError(null);
      await apiClient.cancelBooking(String(bookingId));
      const data = await apiClient.getMyBookings();
      setBookings(Array.isArray(data) ? (data as Booking[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cancel booking');
    }
  };

  const submitFeedback = async (bookingId: string | number) => {
    const key = String(bookingId);
    const draft = feedbackDrafts[key] || { rating: 0, comment: '' };
    if (!draft.rating || draft.rating < 1 || draft.rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setError(null);
      setFeedbackSubmittingId(key);
      const response: any = await apiClient.createFeedback({
        booking_id: key,
        rating: draft.rating,
        comment: draft.comment.trim() || undefined,
      });
      setMyFeedback((prev) => ({
        ...prev,
        [key]: {
          id: String(response?.id || response?.feedback_id || key),
          booking_id: key,
          rating: draft.rating,
          comment: draft.comment.trim(),
          is_public: Boolean(response?.is_public),
        },
      }));
      setFeedbackDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit feedback.');
    } finally {
      setFeedbackSubmittingId(null);
    }
  };

  if (isLoading || (!isAuthenticated && !isLoading)) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Booking History</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">View and manage your bookings.</p>
          </div>
          <Button onClick={() => router.push('/book')} className="bg-red-600 hover:bg-red-700">
            Book a Ride
          </Button>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading bookings...</span>
          </div>
        ) : sortedBookings.length === 0 ? (
          <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
            <p className="text-gray-700 dark:text-gray-300">No bookings yet.</p>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => router.push('/book')} className="bg-red-600 hover:bg-red-700">
                Create your first booking
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {sortedBookings.map((b) => {
              const pickupDate = b.pickup_time ? new Date(b.pickup_time) : null;
              const status = (b.status || 'UNKNOWN').toString();
              const isCompleted = status.toUpperCase() === 'COMPLETED';
              const canCancel = !['CANCELLED', 'COMPLETED'].includes(status.toUpperCase());
              const bookingKey = String(b.id);
              const existingFeedback = myFeedback[bookingKey];
              const draft = feedbackDrafts[bookingKey] || { rating: 0, comment: '' };
              const confirmedFare = typeof b.confirmed_fare === 'number' ? b.confirmed_fare : null;
              const estimatedFare =
                confirmedFare === null && typeof b.estimated_fare === 'number' ? b.estimated_fare : null;

              return (
                <div
                  key={String(b.id)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {b.pickup_address} → {b.dropoff_address}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="inline-flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {pickupDate ? pickupDate.toLocaleDateString('en-GB') : '—'}
                            </span>
                            <span className="inline-flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              {pickupDate
                                ? pickupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : '—'}
                            </span>
                            {b.vehicle_type ? <span>{b.vehicle_type}</span> : null}
                            {confirmedFare !== null ? (
                              <span>£{confirmedFare.toFixed(2)}</span>
                            ) : estimatedFare !== null ? (
                              <span>£{estimatedFare.toFixed(2)}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:justify-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          status.toUpperCase() === 'COMPLETED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : status.toUpperCase() === 'CANCELLED'
                            ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {status}
                      </span>

                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={!canCancel}
                        onClick={() => cancelBooking(b.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                  {isCompleted && (
                    <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                      {existingFeedback ? (
                        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Your feedback: {existingFeedback.rating}/5 {existingFeedback.is_public ? '(Public)' : '(Pending admin approval)'}
                          </p>
                          {existingFeedback.comment ? (
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">{existingFeedback.comment}</p>
                          ) : null}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Rate your completed service
                          </p>
                          <div className="flex items-center gap-2">
                            {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setFeedbackDrafts((prev) => ({
                                    ...prev,
                                    [bookingKey]: { ...draft, rating: star },
                                  }))
                                }
                                className="text-left"
                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                              >
                                <Star
                                  className={`w-5 h-5 ${star <= draft.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-500'}`}
                                />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={draft.comment}
                            onChange={(e) =>
                              setFeedbackDrafts((prev) => ({
                                ...prev,
                                [bookingKey]: { ...draft, comment: e.target.value },
                              }))
                            }
                            placeholder="Optional comment"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
                            rows={3}
                          />
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            disabled={feedbackSubmittingId === bookingKey}
                            onClick={() => submitFeedback(bookingKey)}
                          >
                            {feedbackSubmittingId === bookingKey ? 'Submitting...' : 'Submit Feedback'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
