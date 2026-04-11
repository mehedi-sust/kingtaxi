'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, MapPin, Calculator, Phone } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface Fare {
  id: number;
  route_name: string;
  pickup_pattern: string;
  dropoff_pattern: string;
  vehicle_type: string;
  price: number;
  is_active: boolean;
}

export default function InteractiveFareTable() {
  const [fares, setFares] = useState<Fare[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<'FOUR_SEATER' | 'EIGHT_SEATER' | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFares();
  }, []);

  const fetchFares = async () => {
    try {
      const data = await apiClient.getPublicFares();
      setFares((data as Fare[]).filter((fare) => fare.is_active));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fourSeaterFares = fares.filter((fare) => fare.vehicle_type.toLowerCase().includes('4-seater') || fare.vehicle_type.toLowerCase().includes('4'));
  const eightSeaterFares = fares.filter((fare) => fare.vehicle_type.toLowerCase().includes('8-seater') || fare.vehicle_type.toLowerCase().includes('8'));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Error loading fares: {error}</p>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            King Taxi Fares
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Transparent pricing for all airport routes
          </p>
        </motion.div>

        {/* Vehicle Type Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg">
            <button
              onClick={() => setSelectedVehicle('ALL')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                selectedVehicle === 'ALL'
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All Vehicles
            </button>
            <button
              onClick={() => setSelectedVehicle('FOUR_SEATER')}
              className={`px-6 py-3 rounded-md font-medium transition-all ml-2 ${
                selectedVehicle === 'FOUR_SEATER'
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              4-Seater
            </button>
            <button
              onClick={() => setSelectedVehicle('EIGHT_SEATER')}
              className={`px-6 py-3 rounded-md font-medium transition-all ml-2 ${
                selectedVehicle === 'EIGHT_SEATER'
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              8-Seater
            </button>
          </div>
        </motion.div>

        {/* Fare Tables */}
        <div className={`grid gap-8 max-w-6xl mx-auto ${
          selectedVehicle === 'ALL' 
            ? 'grid-cols-1 lg:grid-cols-2 place-items-center' 
            : 'grid-cols-1 place-items-center'
        }`}>
          {/* 4-Seater Table */}
          {(selectedVehicle === 'ALL' || selectedVehicle === 'FOUR_SEATER') && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden w-full max-w-md mx-auto"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-center mb-2">
                  <Car className="w-8 h-8 mr-3" />
                  <h3 className="text-2xl font-bold">4-Seater</h3>
                </div>
                <p className="text-blue-100 text-center">Premium Sedan</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {fourSeaterFares.map((fare, index) => (
                    <motion.div
                      key={fare.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {fare.route_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {fare.pickup_pattern} → {fare.dropoff_pattern}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          £{fare.price}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 8-Seater Table */}
          {(selectedVehicle === 'ALL' || selectedVehicle === 'EIGHT_SEATER') && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden w-full max-w-md mx-auto"
            >
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <div className="flex items-center justify-center mb-2">
                  <Car className="w-8 h-8 mr-3" />
                  <h3 className="text-2xl font-bold">8-Seater</h3>
                </div>
                <p className="text-green-100 text-center">Family MPV</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {eightSeaterFares.map((fare, index) => (
                    <motion.div
                      key={fare.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {fare.route_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {fare.pickup_pattern} → {fare.dropoff_pattern}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          £{fare.price}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="bg-yellow-500 text-black p-6 rounded-xl shadow-xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Book?</h3>
            <p className="text-lg mb-6">
              100% guarantee on our services • No extra costs • No hidden charges
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+4401233367357"
                className="bg-black text-yellow-500 px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Now: +44 01233 367 357
              </a>
              <Link
                href="/book"
                className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Book Online
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
