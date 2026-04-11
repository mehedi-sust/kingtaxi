'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Car, Users, Plane, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'All Vehicles', icon: Car },
    { id: 'executive', name: 'Executive', icon: Car },
    { id: 'family', name: 'Family', icon: Users },
    { id: 'airport', name: 'Airport Transfer', icon: Plane },
    { id: 'eco', name: 'Eco-Friendly', icon: Zap },
  ];

  const vehicles = [
    {
      id: 1,
      name: 'BMW 5 Series',
      category: 'executive',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      description: 'Luxury executive sedan perfect for business travel and special occasions. Features leather seats, climate control, and premium sound system.',
      features: ['Leather Interior', 'GPS Navigation', 'Climate Control', 'Premium Audio'],
      capacity: '4 passengers'
    },
    {
      id: 2,
      name: 'Mercedes E-Class',
      category: 'executive',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      description: 'Premium luxury vehicle with advanced safety features and spacious interior. Ideal for executive transport and airport transfers.',
      features: ['Advanced Safety', 'Spacious Interior', 'Premium Comfort', 'Wi-Fi Available'],
      capacity: '4 passengers'
    },
    {
      id: 3,
      name: 'Toyota Prius',
      category: 'eco',
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
      description: 'Environmentally friendly hybrid vehicle perfect for eco-conscious travelers. Excellent fuel efficiency and low emissions.',
      features: ['Hybrid Engine', 'Eco-Friendly', 'Fuel Efficient', 'Low Emissions'],
      capacity: '4 passengers'
    },
    {
      id: 4,
      name: 'Ford Transit Minibus',
      category: 'family',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
      description: 'Spacious minibus perfect for group travel, family outings, and airport transfers. Comfortable seating for up to 8 passengers.',
      features: ['8 Passenger Seating', 'Large Luggage Space', 'Air Conditioning', 'Entertainment System'],
      capacity: '8 passengers'
    },
    {
      id: 5,
      name: 'Audi A6',
      category: 'executive',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      description: 'Sophisticated executive vehicle combining luxury and performance. Perfect for business meetings and special events.',
      features: ['Quattro AWD', 'Virtual Cockpit', 'Premium Sound', 'Heated Seats'],
      capacity: '4 passengers'
    },
    {
      id: 6,
      name: 'Volkswagen Touran',
      category: 'family',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      description: 'Versatile family vehicle with flexible seating arrangement. Ideal for families and small groups with luggage.',
      features: ['7 Passenger Seating', 'Flexible Layout', 'Safety Features', 'Easy Access'],
      capacity: '7 passengers'
    },
    {
      id: 7,
      name: 'Tesla Model S',
      category: 'eco',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      description: 'Premium electric luxury sedan with cutting-edge technology and zero emissions. The future of executive transport.',
      features: ['100% Electric', 'Autopilot Ready', 'Premium Interior', 'Supercharging'],
      capacity: '5 passengers'
    },
    {
      id: 8,
      name: 'Mercedes V-Class',
      category: 'airport',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
      description: 'Luxury MPV perfect for airport transfers and group travel. Spacious interior with premium amenities.',
      features: ['Premium Luxury', 'Airport Specialist', 'Large Luggage Capacity', 'Business Lounge Feel'],
      capacity: '7 passengers'
    },
  ];

  const filteredVehicles = selectedCategory === 'all' 
    ? vehicles 
    : vehicles.filter(vehicle => vehicle.category === selectedCategory);

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredVehicles.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? filteredVehicles.length - 1 : selectedImage - 1);
    }
  };

  return (
    <div className="pt-20 bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our <span className="text-red-600">Vehicle Gallery</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Explore our modern, clean and reliable fleet of vehicles. From executive cars to 
              family-friendly options, we have the perfect vehicle for your journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <category.icon className="w-5 h-5 mr-2" />
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedImage(index)}
              >
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat transform hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: `url(${vehicle.image})` }}
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {vehicle.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{vehicle.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {vehicle.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{vehicle.capacity}</span>
                    <span className="text-red-600 dark:text-red-400 font-semibold text-sm">View Details</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredVehicles.length === 0 && (
            <div className="text-center py-20">
              <Car className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No vehicles found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try selecting a different category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-start justify-center overflow-y-auto px-4 pb-8 pt-24 sm:pt-28 sm:pb-12"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[calc(100vh-6rem)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Navigation Buttons */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors duration-200"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors duration-200"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Vehicle Image */}
                <div className="h-96 overflow-hidden rounded-t-2xl">
                  <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${filteredVehicles[selectedImage]?.image})` }}
                  />
                </div>

                {/* Vehicle Details */}
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {filteredVehicles[selectedImage]?.name}
                    </h2>
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium capitalize">
                      {filteredVehicles[selectedImage]?.category}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {filteredVehicles[selectedImage]?.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
                      <ul className="space-y-2">
                        {filteredVehicles[selectedImage]?.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                            <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Capacity</h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-300 mb-6">
                        <Users className="w-5 h-5 mr-2 text-red-600" />
                        {filteredVehicles[selectedImage]?.capacity}
                      </div>

                      <div className="space-y-3">
                        <Link
                          href="/book"
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 text-center block"
                        >
                          Book This Vehicle
                        </Link>
                        <Link
                          href="/book"
                          className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-center block"
                        >
                          Get Quote
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Book Your Perfect Ride?
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
              Choose from our premium fleet of vehicles and experience the comfort, 
              safety, and reliability that King Taxi is known for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              >
                Book Now
              </Link>
              <a
                href="tel:+4401233367357"
                className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                Call: +44 01233 367 357
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
