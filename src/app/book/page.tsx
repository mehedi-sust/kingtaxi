'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, Phone, Car, CreditCard, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type PlaceSuggestion = {
  place_id: string | number;
  display_name: string;
  lat: string;
  lon: string;
};

function toTelHref(phone: string) {
  const raw = (phone || '').trim();
  if (!raw) return '';
  const normalized = raw.replace(/[^\d+]/g, '');
  return `tel:${normalized || raw}`;
}

function normalizeToE164(phone: string) {
  const raw = (phone || '').trim();
  if (!raw) return '';

  let normalized = raw.replace(/[^\d+]/g, '');
  if (normalized.startsWith('00')) normalized = `+${normalized.slice(2)}`;

  if (normalized.startsWith('+')) {
    normalized = `+${normalized.slice(1).replace(/\D/g, '')}`;
  } else {
    normalized = normalized.replace(/\D/g, '');
  }

  if (!normalized.startsWith('+')) {
    if (normalized.startsWith('0')) normalized = `+44${normalized.slice(1)}`;
    else if (normalized.startsWith('44')) normalized = `+${normalized}`;
  }

  return normalized;
}

function isE164(phone: string) {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
}

export default function BookRide() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    pickup_location: '',
    destination: '',
    pickup_date: '',
    pickup_time: '',
    passengers: '1',
    vehicle_type: '',
    notes: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
  });

  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState<number | null>(null);
  const [estimatedDurationMin, setEstimatedDurationMin] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<PlaceSuggestion[]>([]);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const skipNextPickupSuggest = useRef(false);
  const skipNextDestinationSuggest = useRef(false);
  const routeAbortRef = useRef<AbortController | null>(null);

  const vehicleTypes = [
    {
      id: 'standard',
      name: 'Standard Car',
      description: 'Comfortable sedan for up to 4 passengers',
      price: 'From £3.50',
      icon: Car,
      capacity: '1-4 passengers',
    },
    {
      id: 'executive',
      name: 'Executive Car',
      description: 'Premium luxury vehicle for business travel',
      price: 'From £5.00',
      icon: Car,
      capacity: '1-4 passengers',
    },
    {
      id: 'minibus',
      name: 'Minibus',
      description: 'Spacious vehicle for group travel',
      price: 'From £8.00',
      icon: Users,
      capacity: '5-8 passengers',
    },
  ];

  const computeEstimatedFare = useCallback((distanceKm: number, durationMin: number, vehicleType: string) => {
    const base = 3.0;
    const perKm = 1.6;
    const perMin = 0.25;
    const minByVehicle: Record<string, number> = {
      standard: 8,
      executive: 12,
      minibus: 18,
    };
    const multiplierByVehicle: Record<string, number> = {
      standard: 1,
      executive: 1.35,
      minibus: 1.8,
    };

    const vehicleId = vehicleType || 'standard';
    const minFare = minByVehicle[vehicleId] ?? 8;
    const multiplier = multiplierByVehicle[vehicleId] ?? 1;
    const raw = (base + perKm * distanceKm + perMin * durationMin) * multiplier;
    const final = Math.max(raw, minFare);
    return Math.round(final * 100) / 100;
  }, []);

  const fetchUkAddressSuggestions = async (query: string, signal?: AbortSignal) => {
    const q = query.trim();
    if (q.length < 3) return [];
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=gb&addressdetails=1&q=${encodeURIComponent(
      q
    )}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal,
    });
    const data = await response.json();
    return Array.isArray(data) ? (data as PlaceSuggestion[]) : [];
  };

  const resolveCoords = async (address: string) => {
    try {
      const results = await fetchUkAddressSuggestions(address);
      const first = Array.isArray(results) ? results[0] : null;
      if (!first) return null;
      const lat = Number((first as any).lat);
      const lng = Number((first as any).lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return { lat, lng };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (step !== 1) return;
    if (skipNextPickupSuggest.current) {
      skipNextPickupSuggest.current = false;
      return;
    }
    const q = bookingData.pickup_location.trim();
    if (q.length < 3) {
      setPickupSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const results = await fetchUkAddressSuggestions(q, controller.signal);
        setPickupSuggestions(results);
      } catch {
        setPickupSuggestions([]);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [bookingData.pickup_location, step]);

  useEffect(() => {
    if (step !== 1) return;
    if (skipNextDestinationSuggest.current) {
      skipNextDestinationSuggest.current = false;
      return;
    }
    const q = bookingData.destination.trim();
    if (q.length < 3) {
      setDestinationSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const results = await fetchUkAddressSuggestions(q, controller.signal);
        setDestinationSuggestions(results);
      } catch {
        setDestinationSuggestions([]);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [bookingData.destination, step]);

  const calculateRouteAndFare = useCallback(
    async (coords?: { pickup: { lat: number; lng: number }; dropoff: { lat: number; lng: number } }) => {
      const pickup = coords?.pickup ?? pickupCoords;
      const dropoff = coords?.dropoff ?? dropoffCoords;
      if (!pickup || !dropoff) return;

      routeAbortRef.current?.abort();
      const controller = new AbortController();
      routeAbortRef.current = controller;

      setIsCalculating(true);
      try {
        const pickupTimeIso =
          bookingData.pickup_date && bookingData.pickup_time
            ? new Date(`${bookingData.pickup_date}T${bookingData.pickup_time}:00`).toISOString()
            : null;

        const estimate = await apiClient.estimateFare(
          {
            pickup_lat: pickup.lat,
            pickup_lng: pickup.lng,
            dropoff_lat: dropoff.lat,
            dropoff_lng: dropoff.lng,
            pickup_address: bookingData.pickup_location || undefined,
            dropoff_address: bookingData.destination || undefined,
            trip_type: 'standard',
            ...(pickupTimeIso ? { pickup_time: pickupTimeIso } : {}),
          },
          { signal: controller.signal }
        );

        if (routeAbortRef.current !== controller) return;

        const distanceKmRaw = (estimate as any)?.distance_km;
        const durationMinRaw = (estimate as any)?.duration_min;
        const distanceKm = typeof distanceKmRaw === 'number' ? Math.round(distanceKmRaw * 100) / 100 : null;
        const durationMin = typeof durationMinRaw === 'number' ? Math.round(durationMinRaw * 10) / 10 : null;
        setEstimatedDistanceKm(distanceKm);
        setEstimatedDurationMin(durationMin);

        const fareRaw = (estimate as any)?.estimated_fare;
        const fare =
          typeof fareRaw === 'number'
            ? Math.round(fareRaw * 100) / 100
            : distanceKm !== null && durationMin !== null
            ? computeEstimatedFare(distanceKm, durationMin, bookingData.vehicle_type)
            : null;
        setEstimatedFare(fare);
      } catch (e) {
        if (routeAbortRef.current !== controller) return;
        setEstimatedDistanceKm(null);
        setEstimatedDurationMin(null);
        setEstimatedFare(null);
      } finally {
        if (routeAbortRef.current === controller) setIsCalculating(false);
      }
    },
    [
      bookingData.destination,
      bookingData.pickup_date,
      bookingData.pickup_location,
      bookingData.pickup_time,
      bookingData.vehicle_type,
      computeEstimatedFare,
      dropoffCoords,
      pickupCoords,
    ]
  );

  const calculateFare = async () => {
    if (!bookingData.pickup_location || !bookingData.destination) return;
    const pickup = pickupCoords ?? (await resolveCoords(bookingData.pickup_location));
    const dropoff = dropoffCoords ?? (await resolveCoords(bookingData.destination));
    if (!pickup || !dropoff) {
      setEstimatedFare(null);
      setEstimatedDistanceKm(null);
      setEstimatedDurationMin(null);
      return;
    }
    if (!pickupCoords) setPickupCoords(pickup);
    if (!dropoffCoords) setDropoffCoords(dropoff);
    await calculateRouteAndFare({ pickup, dropoff });
  };

  useEffect(() => {
    if (step !== 1) return;
    if (!pickupCoords || !dropoffCoords) return;
    if (!bookingData.vehicle_type) return;
    const t = window.setTimeout(() => {
      calculateRouteAndFare();
    }, 200);
    return () => window.clearTimeout(t);
  }, [pickupCoords, dropoffCoords, bookingData.vehicle_type, step, calculateRouteAndFare]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (step !== 2) return;

    let cancelled = false;
    const identifier = user?.identifier ?? '';
    const looksLikeEmail = identifier.includes('@');

    const applyProfile = (profile: any) => {
      if (cancelled) return;
      setBookingData((prev) => ({
        ...prev,
        contact_name: prev.contact_name || (typeof profile?.full_name === 'string' ? profile.full_name : ''),
        contact_email:
          prev.contact_email ||
          (typeof profile?.email === 'string' ? profile.email : '') ||
          (looksLikeEmail ? identifier : ''),
        contact_phone:
          prev.contact_phone ||
          (typeof profile?.phone === 'string' ? profile.phone : '') ||
          (!looksLikeEmail ? identifier : ''),
      }));
    };

    const load = async () => {
      try {
        const profile = await apiClient.getUser();
        applyProfile(profile);
        return;
      } catch {}

      try {
        const raw = localStorage.getItem('kingtaxi_profile');
        if (!raw) return;
        applyProfile(JSON.parse(raw));
      } catch {}
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, step, user?.identifier]);

  const nextStep = () => {
    if (step === 1 && bookingData.pickup_location && bookingData.destination && bookingData.vehicle_type) {
      calculateFare();
    }
    setSubmitError(null);
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setSubmitError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!termsAccepted) {
      setSubmitError('Please accept the terms and conditions to continue.');
      return;
    }
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const dateTimeIso = new Date(
        `${bookingData.pickup_date}T${bookingData.pickup_time}:00`
      ).toISOString();

      const normalizedPhone = normalizeToE164(bookingData.contact_phone);
      if (!normalizedPhone || !isE164(normalizedPhone)) {
        setSubmitError('Enter a valid phone number including country code (e.g. +447...).');
        return;
      }

      const finalPickup = pickupCoords ?? (await resolveCoords(bookingData.pickup_location));
      const finalDropoff = dropoffCoords ?? (await resolveCoords(bookingData.destination));
      if (!finalPickup || !finalDropoff) {
        setSubmitError('Select a pickup and destination from suggestions to confirm booking.');
        return;
      }

      const noteParts = [
        bookingData.notes?.trim() ? `Notes: ${bookingData.notes.trim()}` : '',
        bookingData.contact_name?.trim() ? `Contact: ${bookingData.contact_name.trim()}` : '',
        bookingData.contact_email?.trim() ? `Email: ${bookingData.contact_email.trim()}` : '',
      ].filter(Boolean);
      const notes = noteParts.length > 0 ? noteParts.join(' | ') : undefined;

      await apiClient.createBooking({
        customer_phone: normalizedPhone,
        pickup_address: bookingData.pickup_location,
        dropoff_address: bookingData.destination,
        pickup_lat: finalPickup.lat,
        pickup_lng: finalPickup.lng,
        dropoff_lat: finalDropoff.lat,
        dropoff_lng: finalDropoff.lng,
        pickup_time: dateTimeIso,
        trip_type: 'standard',
        vehicle_type: bookingData.vehicle_type,
        notes,
      });
      setStep(4); // Success step
    } catch (error) {
      console.error('Booking failed:', error);
      setSubmitError(error instanceof Error ? error.message : 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your taxi has been booked successfully. You will receive a confirmation SMS and email shortly.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Booking Details:</h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p><strong>From:</strong> {bookingData.pickup_location}</p>
              <p><strong>To:</strong> {bookingData.destination}</p>
              <p><strong>Date:</strong> {bookingData.pickup_date}</p>
              <p><strong>Time:</strong> {bookingData.pickup_time}</p>
              <p><strong>Vehicle:</strong> {vehicleTypes.find(v => v.id === bookingData.vehicle_type)?.name}</p>
              {estimatedFare && (
                <>
                  <p><strong>Estimated Fare:</strong> £{estimatedFare}</p>
                  {(estimatedDistanceKm !== null || estimatedDurationMin !== null) && (
                    <>
                      {estimatedDistanceKm !== null && <p><strong>Distance:</strong> {estimatedDistanceKm} km</p>}
                      {estimatedDurationMin !== null && <p><strong>Estimated time:</strong> {estimatedDurationMin} min</p>}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
              Track Your Ride
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Book Your Ride
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Quick and easy booking process. Get an instant quote and confirm your journey in just a few steps.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 ${
                    step > stepNumber ? 'bg-red-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Step 1: Journey Details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Journey Details</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pickup Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="pickupLocation"
                        name="pickupLocation"
                        value={bookingData.pickup_location}
                        onChange={(e) => {
                          setPickupCoords(null);
                          setBookingData((prev) => ({ ...prev, pickup_location: e.target.value }));
                        }}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter pickup address"
                      />
                    </div>
                    {pickupSuggestions.length > 0 && (
                      <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                        {pickupSuggestions.map((s) => (
                          <button
                            key={String(s.place_id)}
                            type="button"
                            onClick={() => {
                              skipNextPickupSuggest.current = true;
                              setPickupSuggestions([]);
                              setPickupCoords({ lat: Number(s.lat), lng: Number(s.lon) });
                              setBookingData((prev) => ({ ...prev, pickup_location: s.display_name }));
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {s.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Destination *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={bookingData.destination}
                        onChange={(e) => {
                          setDropoffCoords(null);
                          setBookingData((prev) => ({ ...prev, destination: e.target.value }));
                        }}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter destination address"
                      />
                    </div>
                    {destinationSuggestions.length > 0 && (
                      <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                        {destinationSuggestions.map((s) => (
                          <button
                            key={String(s.place_id)}
                            type="button"
                            onClick={() => {
                              skipNextDestinationSuggest.current = true;
                              setDestinationSuggestions([]);
                              setDropoffCoords({ lat: Number(s.lat), lng: Number(s.lon) });
                              setBookingData((prev) => ({ ...prev, destination: s.display_name }));
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {s.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={bookingData.pickup_date}
                        onChange={(e) => setBookingData(prev => ({ ...prev, pickup_date: e.target.value }))}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={bookingData.pickup_time}
                        onChange={(e) => setBookingData(prev => ({ ...prev, pickup_time: e.target.value }))}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Passengers *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <select
                        id="passengers"
                        name="passengers"
                        value={bookingData.passengers}
                        onChange={(e) => setBookingData(prev => ({ ...prev, passengers: e.target.value }))}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 dark:text-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num.toString()}>{num} passenger{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Vehicle Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {vehicleTypes.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          bookingData.vehicle_type === vehicle.id
                            ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => setBookingData(prev => ({ ...prev, vehicle_type: vehicle.id }))}
                      >
                        <div className="flex items-center mb-3">
                          <vehicle.icon className="w-6 h-6 text-red-600 mr-2" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">{vehicle.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{vehicle.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{vehicle.capacity}</span>
                          <span className="font-semibold text-red-600">{vehicle.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Contact Details */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Details & Fare Estimate</h2>
              
              {/* Fare Estimate */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white mb-8">
                <h3 className="text-xl font-bold mb-4">Fare Estimate</h3>
                {isCalculating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    <span>Calculating your fare...</span>
                  </div>
                ) : estimatedFare ? (
                  <div>
                    <div className="text-3xl font-bold mb-2">£{estimatedFare}</div>
                    {(estimatedDistanceKm !== null || estimatedDurationMin !== null) && (
                      <div className="text-sm text-red-100 space-y-1">
                        {estimatedDistanceKm !== null && <div>Distance: {estimatedDistanceKm} km</div>}
                        {estimatedDurationMin !== null && <div>Estimated time: {estimatedDurationMin} min</div>}
                      </div>
                    )}
                    <p className="text-red-100 text-sm">
                      This is an estimated fare. Final price may vary based on traffic and route taken.
                    </p>
                  </div>
                ) : (
                  <p>Fare will be calculated based on your journey details.</p>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={bookingData.contact_name}
                    onChange={(e) => setBookingData(prev => ({ ...prev, contact_name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        value={bookingData.contact_phone}
                        onChange={(e) => setBookingData(prev => ({ ...prev, contact_phone: e.target.value }))}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={bookingData.contact_email}
                      onChange={(e) => setBookingData(prev => ({ ...prev, contact_email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your email (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={bookingData.notes}
                    onChange={(e) => setBookingData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 resize-none dark:bg-gray-700 dark:text-white"
                    placeholder="Any instruction for the driver?"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Confirm Your Booking</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">From:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{bookingData.pickup_location}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">To:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{bookingData.destination}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Date & Time:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{bookingData.pickup_date} at {bookingData.pickup_time}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Passengers:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{bookingData.passengers} passenger{parseInt(bookingData.passengers) > 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Vehicle:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{vehicleTypes.find(v => v.id === bookingData.vehicle_type)?.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Contact:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{bookingData.contact_name}</p>
                        {bookingData.contact_phone ? (
                          <a href={toTelHref(bookingData.contact_phone)} className="text-sm text-gray-600 dark:text-gray-300 hover:underline">
                            {bookingData.contact_phone}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-300">-</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {estimatedFare && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Estimated Fare:</span>
                        <span className="text-2xl font-bold text-red-600">£{estimatedFare}</span>
                      </div>
                      {(estimatedDistanceKm !== null || estimatedDurationMin !== null) && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          {estimatedDistanceKm !== null && <div>Distance: {estimatedDistanceKm} km</div>}
                          {estimatedDurationMin !== null && <div>Estimated time: {estimatedDurationMin} min</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Payment Information</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Payment can be made by cash, card, or contactless payment directly to your driver. 
                    No advance payment required for this booking.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 dark:bg-gray-800 dark:border-gray-600"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      I agree to the <a href="#" className="text-red-600 hover:text-red-700">terms and conditions</a>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {submitError && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Previous
              </button>
            )}
            
            <div className="ml-auto">
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={
                    (step === 1 && (!bookingData.pickup_location || !bookingData.destination || !bookingData.pickup_date || !bookingData.pickup_time || !bookingData.vehicle_type)) ||
                    (step === 2 && (!bookingData.contact_name || !bookingData.contact_phone))
                  }
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors duration-200"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !termsAccepted}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors duration-200 flex items-center"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
