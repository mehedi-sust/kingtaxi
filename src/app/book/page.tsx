'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, Phone, Car, CreditCard, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type AddressSuggestion = {
  label: string;
  lat: number;
  lon: number;
};

export default function BookRide() {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    pickup_location: '',
    destination: '',
    pickup_date: '',
    pickup_time: '',
    passengers: '1',
    vehicle_type: '',
    special_requests: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
  });

  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<AddressSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<AddressSuggestion[]>([]);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

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

  const normalizePhoneForApi = (value: string) => {
    const digits = value.replace(/[^\d+]/g, '');
    if (digits.startsWith('+')) return digits;
    if (digits.startsWith('0')) return `+44${digits.slice(1)}`;
    return `+${digits}`;
  };

  const lookupAddressSuggestions = async (query: string) => {
    const value = query.trim();
    if (value.length < 3) return [];
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data
      .map((item: any) => ({
        label: String(item?.display_name || ''),
        lat: Number(item?.lat),
        lon: Number(item?.lon),
      }))
      .filter((item: AddressSuggestion) => item.label && Number.isFinite(item.lat) && Number.isFinite(item.lon))
      .slice(0, 6);
  };

  const resolveCoordinates = async (
    address: string,
    current: { lat: number; lng: number } | null
  ): Promise<{ lat: number; lng: number } | null> => {
    if (current) return current;
    const candidates = await lookupAddressSuggestions(address);
    if (!candidates.length) return null;
    return { lat: candidates[0].lat, lng: candidates[0].lon };
  };

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const query = bookingData.pickup_location.trim();
      if (query.length < 3) {
        setPickupSuggestions([]);
        setShowPickupSuggestions(false);
        return;
      }
      const items = await lookupAddressSuggestions(query);
      if (cancelled) return;
      setPickupSuggestions(items);
      setShowPickupSuggestions(items.length > 0);
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [bookingData.pickup_location]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const query = bookingData.destination.trim();
      if (query.length < 3) {
        setDropoffSuggestions([]);
        setShowDropoffSuggestions(false);
        return;
      }
      const items = await lookupAddressSuggestions(query);
      if (cancelled) return;
      setDropoffSuggestions(items);
      setShowDropoffSuggestions(items.length > 0);
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [bookingData.destination]);

  const calculateFare = async () => {
    if (!bookingData.pickup_location || !bookingData.destination) return;

    setIsCalculating(true);
    try {
      const pickup = await resolveCoordinates(bookingData.pickup_location, pickupCoords);
      const dropoff = await resolveCoordinates(bookingData.destination, dropoffCoords);
      if (!pickup || !dropoff) {
        setEstimatedFare(null);
        return;
      }
      const result: any = await apiClient.estimateFare({
        pickup_address: bookingData.pickup_location,
        dropoff_address: bookingData.destination,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        trip_type: 'standard',
      });
      const amount = Number(result?.estimated_fare ?? result?.fare ?? result?.total_fare ?? NaN);
      if (!Number.isNaN(amount) && amount > 0) {
        setEstimatedFare(Math.round(amount * 100) / 100);
      } else {
        setEstimatedFare(null);
      }
    } catch {
      setEstimatedFare(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && bookingData.pickup_location && bookingData.destination && bookingData.vehicle_type) {
      void calculateFare();
    }
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!termsAccepted) {
      setSubmitError('Please accept the terms and conditions before confirming.');
      return;
    }
    try {
      const pickup = await resolveCoordinates(bookingData.pickup_location, pickupCoords);
      const dropoff = await resolveCoordinates(bookingData.destination, dropoffCoords);
      if (!pickup || !dropoff) {
        setSubmitError('Please choose valid pickup and destination addresses from suggestions.');
        return;
      }

      const dateTimeIso = new Date(
        `${bookingData.pickup_date}T${bookingData.pickup_time}:00`
      ).toISOString();
      const vehicleName =
        bookingData.vehicle_type === 'executive'
          ? 'Executive Sedan'
          : bookingData.vehicle_type === 'minibus'
          ? '8-Seater Minibus'
          : '4-Seater Premium Sedan';
      await apiClient.createBooking({
        customer_phone: normalizePhoneForApi(bookingData.contact_phone),
        pickup_address: bookingData.pickup_location,
        dropoff_address: bookingData.destination,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        pickup_time: dateTimeIso,
        trip_type: 'standard',
        vehicle_type: vehicleName,
        notes: bookingData.special_requests || undefined,
      });
      setStep(4); // Success step
    } catch (error) {
      console.error('Booking failed:', error);
      setSubmitError(error instanceof Error ? error.message : 'Booking failed. Please try again.');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const prefill = async () => {
      try {
        const user: any = await apiClient.getUser();
        if (cancelled || !user) return;
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
        setBookingData((prev) => ({
          ...prev,
          contact_name: prev.contact_name || user.full_name || fullName || '',
          contact_phone: prev.contact_phone || user.phone || '',
          contact_email: prev.contact_email || user.email || '',
        }));
      } catch {
        // Ignore prefill failure
      }
    };
    void prefill();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Booking Requested!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Booking requested successfully. An agent will confirm your booking with the final fare and assign a driver shortly.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Booking Details:</h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p><strong>From:</strong> {bookingData.pickup_location}</p>
              <p><strong>To:</strong> {bookingData.destination}</p>
              <p><strong>Date:</strong> {bookingData.pickup_date}</p>
              <p><strong>Time:</strong> {bookingData.pickup_time}</p>
              <p><strong>Vehicle:</strong> {vehicleTypes.find(v => v.id === bookingData.vehicle_type)?.name}</p>
              {estimatedFare && <p><strong>Estimated Fare:</strong> £{estimatedFare}</p>}
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
                          const value = e.target.value;
                          setBookingData(prev => ({ ...prev, pickup_location: value }));
                          setPickupCoords(null);
                        }}
                        onFocus={() => setShowPickupSuggestions(pickupSuggestions.length > 0)}
                        onBlur={() => {
                          window.setTimeout(() => setShowPickupSuggestions(false), 120);
                        }}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter pickup address"
                      />
                      {showPickupSuggestions && pickupSuggestions.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg max-h-56 overflow-y-auto">
                          {pickupSuggestions.map((item, index) => (
                            <button
                              key={`${item.label}-${index}`}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setBookingData((prev) => ({ ...prev, pickup_location: item.label }));
                                setPickupCoords({ lat: item.lat, lng: item.lon });
                                setShowPickupSuggestions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                          const value = e.target.value;
                          setBookingData(prev => ({ ...prev, destination: value }));
                          setDropoffCoords(null);
                        }}
                        onFocus={() => setShowDropoffSuggestions(dropoffSuggestions.length > 0)}
                        onBlur={() => {
                          window.setTimeout(() => setShowDropoffSuggestions(false), 120);
                        }}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter destination address"
                      />
                      {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg max-h-56 overflow-y-auto">
                          {dropoffSuggestions.map((item, index) => (
                            <button
                              key={`${item.label}-${index}`}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setBookingData((prev) => ({ ...prev, destination: item.label }));
                                setDropoffCoords({ lat: item.lat, lng: item.lon });
                                setShowDropoffSuggestions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData(prev => ({ ...prev, special_requests: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 resize-none dark:bg-gray-700 dark:text-white"
                    placeholder="Any special requirements? (child seat, wheelchair access, etc.)"
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
                        <p className="text-sm text-gray-600 dark:text-gray-300">{bookingData.contact_phone}</p>
                      </div>
                    </div>
                  </div>
                  {estimatedFare && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Estimated Fare:</span>
                        <span className="text-2xl font-bold text-red-600">£{estimatedFare}</span>
                      </div>
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      I agree to the <a href="#" className="text-red-600 hover:text-red-700">terms and conditions</a>
                    </label>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3"
            >
              {submitError}
            </motion.div>
          )}

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
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Confirm Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
