'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, XCircle } from 'lucide-react';
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

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
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
        const data = await apiClient.getMyBookings();
        setBookings(Array.isArray(data) ? (data as Booking[]) : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load bookings');
        setBookings([]);
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
              const canCancel = !['CANCELLED', 'COMPLETED'].includes(status.toUpperCase());
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
