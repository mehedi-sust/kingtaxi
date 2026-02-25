'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, User, Car, PoundSterling, X } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Booking {
  id: string;
  customer_phone: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_time: string;
  vehicle_type: string;
  estimated_fare?: number;
  confirmed_fare?: number;
  status: string;
  created_at: string;
  driver_id?: string | null;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle_plate: string;
  status: string;
}

function toTelHref(phone: string) {
  const raw = (phone || '').trim();
  if (!raw) return '';
  const normalized = raw.replace(/[^\d+]/g, '');
  return `tel:${normalized || raw}`;
}

function normalizeDriver(input: any): Driver {
  const id = String(input?.id ?? input?.driver_id ?? '');
  const name =
    (typeof input?.name === 'string' && input.name.trim()) ||
    [input?.first_name, input?.last_name].filter(Boolean).join(' ') ||
    String(input?.full_name ?? input?.email ?? input?.phone ?? id);
  return {
    id,
    name,
    phone: String(input?.phone ?? input?.mobile ?? input?.customer_phone ?? ''),
    vehicle_plate: String(input?.vehicle_plate ?? input?.plate ?? input?.vehicle?.plate ?? ''),
    status: String(input?.status ?? input?.driver_status ?? 'UNKNOWN'),
  };
}

function normalizeBooking(input: any): Booking {
  const id = String(input?.id ?? input?.booking_id ?? '');
  const parseFare = (value: unknown) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };
  return {
    id,
    customer_phone: String(input?.customer_phone ?? input?.phone ?? input?.customer?.phone ?? input?.customer?.mobile ?? ''),
    pickup_address: String(input?.pickup_address ?? input?.pickup_location ?? input?.pickup ?? ''),
    dropoff_address: String(input?.dropoff_address ?? input?.destination ?? input?.dropoff ?? ''),
    pickup_time: String(input?.pickup_time ?? input?.pickup_datetime ?? input?.pickup_at ?? input?.scheduled_at ?? input?.created_at ?? ''),
    vehicle_type: String(input?.vehicle_type ?? input?.vehicle ?? input?.vehicle_name ?? ''),
    estimated_fare: parseFare(input?.estimated_fare ?? input?.estimatedFare),
    confirmed_fare: parseFare(input?.confirmed_fare ?? input?.confirmedFare),
    status: String(input?.status ?? input?.booking_status ?? 'UNKNOWN'),
    created_at: String(input?.created_at ?? input?.createdAt ?? ''),
    driver_id: input?.driver_id ?? input?.driverId ?? input?.driver?.id ?? null,
  };
}

export default function BookingManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fareInput, setFareInput] = useState<Record<string, string>>({});
  const [driverSelection, setDriverSelection] = useState<Record<string, string>>({});
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchBookings = async () => {
    try {
      const data = await apiClient.getBookings();
      const raw =
        Array.isArray(data) ? data : Array.isArray((data as any)?.bookings) ? (data as any).bookings : (data as any)?.data;
      const normalized = Array.isArray(raw) ? raw.map(normalizeBooking) : [];
      setBookings(normalized);
      return normalized;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
    return [];
  };

  useEffect(() => {
    fetchBookings();
    apiClient
      .getDrivers()
      .then((data) => {
        const raw =
          Array.isArray(data) ? data : Array.isArray((data as any)?.drivers) ? (data as any).drivers : (data as any)?.data;
        setDrivers(Array.isArray(raw) ? raw.map(normalizeDriver) : []);
      })
      .catch(() => setDrivers([]));
  }, []);

  useEffect(() => {
    if (!showDetailsModal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showDetailsModal]);

  const driverById = drivers.reduce<Record<string, Driver>>((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});

  const formatDate = (value: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
  };

  const formatTime = (value: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMoney = (value?: number) => {
    if (typeof value !== 'number') return '-';
    return `£${value.toFixed(2)}`;
  };

  const confirmBooking = async () => {
    if (!selectedBooking) return;
    const bookingId = selectedBooking.id;
    const needsDriver = !selectedBooking.driver_id;
    const needsFare = typeof selectedBooking.confirmed_fare !== 'number';
    const chosenDriver = driverSelection[bookingId];
    const fareValue = parseFloat(fareInput[bookingId] || '');

    if (needsDriver && !chosenDriver) {
      setError('Select a driver to confirm this booking');
      return;
    }
    if (needsFare && !(fareInput[bookingId] || '').trim()) {
      setError('Enter a fare to confirm this booking');
      return;
    }
    if (needsFare && (Number.isNaN(fareValue) || fareValue <= 0)) {
      setError('Enter a valid fare to confirm this booking');
      return;
    }

    try {
      if (needsDriver) {
        await apiClient.assignBookingDriver(bookingId, chosenDriver);
      }
      if (needsFare) {
        await apiClient.confirmBookingFare(bookingId, fareValue);
      }
      const updated = await fetchBookings();
      const refreshed = updated.find((b) => b.id === bookingId) || null;
      setSelectedBooking(refreshed);
      if (!refreshed) setShowDetailsModal(false);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to confirm booking');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Review and confirm fares, dispatch rides</p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded"
        >
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Booking Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Booking Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      {b.customer_phone ? (
                        <a href={toTelHref(b.customer_phone)} className="text-sm text-gray-900 dark:text-white hover:underline">
                          {b.customer_phone}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatDate(b.pickup_time || b.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatTime(b.pickup_time || b.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto px-4 pb-8 pt-24 sm:pt-28 sm:pb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[calc(100vh-6rem)] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Booking Details</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedBooking.id}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Phone</label>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.customer_phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Pickup Address</label>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.pickup_address || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Dropoff Address</label>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.dropoff_address || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Pickup Date</label>
                  <p className="text-gray-900 dark:text-white">{formatDate(selectedBooking.pickup_time || selectedBooking.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Pickup Time</label>
                  <p className="text-gray-900 dark:text-white">{formatTime(selectedBooking.pickup_time || selectedBooking.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Type</label>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.vehicle_type || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Fare</label>
                  <p className="text-gray-900 dark:text-white">{formatMoney(selectedBooking.estimated_fare)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Confirmed Fare</label>
                  <p className="text-gray-900 dark:text-white">{formatMoney(selectedBooking.confirmed_fare)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Car className="w-4 h-4" />
                    Assign Driver
                  </div>
                  {selectedBooking.driver_id ? (
                    <p className="text-sm text-gray-900 dark:text-white">
                      {driverById[selectedBooking.driver_id]?.name || selectedBooking.driver_id}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <select
                        value={driverSelection[selectedBooking.id] || ''}
                        onChange={(e) => setDriverSelection({ ...driverSelection, [selectedBooking.id]: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select driver</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}{d.vehicle_plate ? ` (${d.vehicle_plate})` : ''}
                          </option>
                        ))}
                      </select>
                      {!driverSelection[selectedBooking.id] && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Choose a driver to complete this booking.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <PoundSterling className="w-4 h-4" />
                    Confirm Fare
                  </div>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Enter fare"
                      value={fareInput[selectedBooking.id] || ''}
                      onChange={(e) => setFareInput({ ...fareInput, [selectedBooking.id]: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    />
                    {!fareInput[selectedBooking.id] && typeof selectedBooking.confirmed_fare !== 'number' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enter a fare to confirm this booking.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={confirmBooking}
                  className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
