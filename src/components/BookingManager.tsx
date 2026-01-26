'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, User, Car, PoundSterling } from 'lucide-react';
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
  return {
    id,
    customer_phone: String(input?.customer_phone ?? input?.phone ?? input?.customer?.phone ?? input?.customer?.mobile ?? ''),
    pickup_address: String(input?.pickup_address ?? input?.pickup_location ?? input?.pickup ?? ''),
    dropoff_address: String(input?.dropoff_address ?? input?.destination ?? input?.dropoff ?? ''),
    pickup_time: String(input?.pickup_time ?? input?.pickup_datetime ?? input?.pickup_at ?? input?.scheduled_at ?? input?.created_at ?? ''),
    vehicle_type: String(input?.vehicle_type ?? input?.vehicle ?? input?.vehicle_name ?? ''),
    estimated_fare:
      typeof input?.estimated_fare === 'number'
        ? input.estimated_fare
        : typeof input?.estimatedFare === 'number'
        ? input.estimatedFare
        : undefined,
    confirmed_fare:
      typeof input?.confirmed_fare === 'number'
        ? input.confirmed_fare
        : typeof input?.confirmedFare === 'number'
        ? input.confirmedFare
        : undefined,
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

  const fetchBookings = async () => {
    try {
      const data = await apiClient.getBookings();
      const raw =
        Array.isArray(data) ? data : Array.isArray((data as any)?.bookings) ? (data as any).bookings : (data as any)?.data;
      setBookings(Array.isArray(raw) ? raw.map(normalizeBooking) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
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

  const confirmFare = async (bookingId: string) => {
    const value = parseFloat(fareInput[bookingId] || '');
    if (isNaN(value) || value <= 0) {
      setError('Enter a valid fare');
      return;
    }
    try {
      await apiClient.confirmBookingFare(bookingId, value);
      await fetchBookings();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to confirm fare');
    }
  };

  const assignDriver = async (bookingId: string) => {
    const driverId = driverSelection[bookingId];
    if (!driverId) {
      setError('Select a driver to assign');
      return;
    }
    try {
      await apiClient.assignBookingDriver(bookingId, driverId);
      await fetchBookings();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to assign driver');
    }
  };

  const driverById = drivers.reduce<Record<string, Driver>>((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pickup</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fare</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
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
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900 dark:text-white">{b.pickup_address} → {b.dropoff_address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {b.pickup_time ? new Date(b.pickup_time).toLocaleDateString() : '-'}
                      </span>
                      <Clock className="w-4 h-4 text-gray-400 ml-3 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {b.pickup_time
                          ? new Date(b.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Car className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">{b.vehicle_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <PoundSterling className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {b.confirmed_fare ?? b.estimated_fare ?? '-'}
                        </span>
                      </div>
                      <input
                        type="number"
                        placeholder="Confirm fare"
                        value={fareInput[b.id] || ''}
                        onChange={(e) => setFareInput({ ...fareInput, [b.id]: e.target.value })}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {b.driver_id ? (
                      <span className="text-sm text-gray-900 dark:text-white">
                        {driverById[b.driver_id]?.name || b.driver_id}
                      </span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <select
                          value={driverSelection[b.id] || ''}
                          onChange={(e) => setDriverSelection({ ...driverSelection, [b.id]: e.target.value })}
                          className="w-44 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select driver</option>
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}{d.vehicle_plate ? ` (${d.vehicle_plate})` : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => assignDriver(b.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Assign
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => confirmFare(b.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm Fare
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
