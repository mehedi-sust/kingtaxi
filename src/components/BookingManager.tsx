'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, User, Car, PoundSterling, Eye, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Booking {
  id: string;
  customer_phone: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_time: string;
  trip_type?: string;
  notes?: string;
  vehicle_type: string;
  estimated_fare?: number;
  confirmed_fare?: number;
  driver_id?: string | null;
  driver?: {
    id: string;
    name?: string;
    phone?: string;
    vehicle_model?: string;
    vehicle_plate?: string;
    status?: string;
  } | null;
  status: string;
  created_at: string;
}

interface Driver {
  id: string;
  name?: string;
  phone?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  status?: string;
}

export default function BookingManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [fareInput, setFareInput] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchBookings = async () => {
    try {
      const data = await apiClient.getBookings();
      setBookings(data as Booking[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await apiClient.getDrivers();
      setDrivers(data as Driver[]);
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchBookings(), fetchDrivers()]);
  }, []);

  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setFareInput(String(booking.confirmed_fare ?? booking.estimated_fare ?? ''));
    setSelectedDriverId(booking.driver_id || booking.driver?.id || '');
    setError(null);
    setSuccess(null);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    setFareInput('');
    setSelectedDriverId('');
  };

  const saveBookingUpdates = async () => {
    if (!selectedBooking) return;
    const value = parseFloat(fareInput || '');
    if (isNaN(value) || value <= 0) {
      setError('Enter a valid fare');
      return;
    }
    try {
      setIsSaving(true);
      await apiClient.confirmBookingFare(selectedBooking.id, value);
      if (selectedDriverId) {
        await apiClient.assignBookingDriver(selectedBooking.id, selectedDriverId);
      }
      await Promise.all([fetchBookings(), fetchDrivers()]);
      setSuccess('Booking updated successfully.');
      closeBookingModal();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update booking');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDriverName = (driver?: Driver | Booking['driver'] | null) => {
    if (!driver) return 'Unassigned';
    return driver.name || driver.phone || driver.vehicle_plate || 'Assigned driver';
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
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded"
        >
          {success}
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
                      <span className="text-sm text-gray-900 dark:text-white">{b.customer_phone}</span>
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
                        {formatDate(b.pickup_time)}
                      </span>
                      <Clock className="w-4 h-4 text-gray-400 ml-3 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatTime(b.pickup_time)}
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
                    <div className="flex items-center">
                      <PoundSterling className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {b.confirmed_fare ?? b.estimated_fare ?? '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {getDriverName(b.driver)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openBookingModal(b)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Booking Details</h3>
              <button onClick={closeBookingModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pickup</p>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.pickup_address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dropoff</p>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.dropoff_address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pickup time</p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(selectedBooking.pickup_time)} {formatTime(selectedBooking.pickup_time)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle</p>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.vehicle_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trip type</p>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.trip_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.notes || '-'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-5 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmed Fare (£)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fareInput}
                  onChange={(e) => setFareInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Driver</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
                >
                  <option value="">No driver selected</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {getDriverName(driver)} {driver.vehicle_plate ? `(${driver.vehicle_plate})` : ''} {driver.status ? `- ${driver.status}` : ''}
                    </option>
                  ))}
                </select>
                {selectedBooking.driver && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Currently assigned: {getDriverName(selectedBooking.driver)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={closeBookingModal}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveBookingUpdates}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Booking'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
