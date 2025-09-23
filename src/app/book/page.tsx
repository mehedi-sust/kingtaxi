'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, Phone, Car, CreditCard, CheckCircle } from 'lucide-react';

export default function BookRide() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    pickupLocation: '',
    destination: '',
    date: '',
    time: '',
    passengers: '1',
    vehicleType: '',
    specialRequests: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });

  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateFare = async () => {
    if (!bookingData.pickupLocation || !bookingData.destination) return;
    
    setIsCalculating(true);
    // Simulate fare calculation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const baseFare = bookingData.vehicleType === 'executive' ? 5.0 : 
                    bookingData.vehicleType === 'minibus' ? 8.0 : 3.5;
    const estimatedDistance = Math.random() * 20 + 5; // Random distance 5-25 miles
    const fare = baseFare + (estimatedDistance * 2.2);
    
    setEstimatedFare(Math.round(fare * 100) / 100);
    setIsCalculating(false);
  };

  const nextStep = () => {
    if (step === 1 && bookingData.pickupLocation && bookingData.destination && bookingData.vehicleType) {
      calculateFare();
    }
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate booking submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep(4); // Success step
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your taxi has been booked successfully. You will receive a confirmation SMS and email shortly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Booking Details:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>From:</strong> {bookingData.pickupLocation}</p>
              <p><strong>To:</strong> {bookingData.destination}</p>
              <p><strong>Date:</strong> {bookingData.date}</p>
              <p><strong>Time:</strong> {bookingData.time}</p>
              <p><strong>Vehicle:</strong> {vehicleTypes.find(v => v.id === bookingData.vehicleType)?.name}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Book Your Ride
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Journey Details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Journey Details</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="pickupLocation"
                        name="pickupLocation"
                        value={bookingData.pickupLocation}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter pickup address"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                      Destination *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={bookingData.destination}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter destination address"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={bookingData.time}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-2">
                      Passengers *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <select
                        id="passengers"
                        name="passengers"
                        value={bookingData.passengers}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num.toString()}>{num} passenger{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Vehicle Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {vehicleTypes.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          bookingData.vehicleType === vehicle.id
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setBookingData(prev => ({ ...prev, vehicleType: vehicle.id }))}
                      >
                        <div className="flex items-center mb-3">
                          <vehicle.icon className="w-6 h-6 text-red-600 mr-2" />
                          <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{vehicle.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">{vehicle.capacity}</span>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Details & Fare Estimate</h2>
              
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
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={bookingData.contactName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        value={bookingData.contactPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={bookingData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter your email (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 resize-none"
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Your Booking</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">From:</span>
                        <p className="font-medium">{bookingData.pickupLocation}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">To:</span>
                        <p className="font-medium">{bookingData.destination}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Date & Time:</span>
                        <p className="font-medium">{bookingData.date} at {bookingData.time}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Passengers:</span>
                        <p className="font-medium">{bookingData.passengers} passenger{parseInt(bookingData.passengers) > 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Vehicle:</span>
                        <p className="font-medium">{vehicleTypes.find(v => v.id === bookingData.vehicleType)?.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Contact:</span>
                        <p className="font-medium">{bookingData.contactName}</p>
                        <p className="text-sm text-gray-600">{bookingData.contactPhone}</p>
                      </div>
                    </div>
                  </div>
                  {estimatedFare && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Estimated Fare:</span>
                        <span className="text-2xl font-bold text-red-600">£{estimatedFare}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Payment Information</h4>
                  <p className="text-sm text-blue-800">
                    Payment can be made by cash, card, or contactless payment directly to your driver. 
                    No advance payment required for this booking.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                      I agree to the <a href="#" className="text-red-600 hover:text-red-700">terms and conditions</a>
                    </label>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
              >
                Previous
              </button>
            )}
            
            <div className="ml-auto">
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={
                    (step === 1 && (!bookingData.pickupLocation || !bookingData.destination || !bookingData.date || !bookingData.time || !bookingData.vehicleType)) ||
                    (step === 2 && (!bookingData.contactName || !bookingData.contactPhone))
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
