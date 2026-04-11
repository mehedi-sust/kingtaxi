'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Car, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function DriverDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [application, setApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAccepted = useMemo(() => {
    const status = String(application?.status ?? '').trim().toLowerCase();
    return application?.is_approved === true || status === 'approved' || status === 'accepted' || status === 'active';
  }, [application]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/signin');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getMyDriverApplication();
        if (cancelled) return;
        setApplication(data);
      } catch (e) {
        if (cancelled) return;
        setApplication(null);
        setError(e instanceof Error ? e.message : 'Failed to load driver dashboard');
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!loading && isAuthenticated && !isAccepted) router.replace('/driver-application');
  }, [isAccepted, isAuthenticated, loading, router]);

  if (isLoading || (!isAuthenticated && !isLoading)) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Driver Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Your driver account and upcoming activity.</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/">Back</Link>
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
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading dashboard...</span>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">Account Status</div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-300">Application Status</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {String(application?.status ?? 'approved')}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-300">Driver ID</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {application?.driver_id ?? application?.driverId ?? application?.id ?? '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">Next Appointment</div>
                </div>
                <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                  No upcoming appointments.
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-blue-600" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">My Car</div>
                </div>
                <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 space-y-1">
                  <div>Model: {application?.vehicle_model ?? application?.vehicleModel ?? '—'}</div>
                  <div>Plate: {application?.vehicle_plate ?? application?.vehiclePlate ?? '—'}</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                    <Link href="/bookings">My Bookings</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/account">My Account</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

