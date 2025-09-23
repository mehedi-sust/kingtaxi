'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FareAndFleet() {
  // Car rotation state
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  
  // Using actual car images from public folder - only 2 cars for rotation
  const featuredCars = [
    {
      id: 1,
      name: 'King Taxi Premium',
      type: 'Executive',
      image: '/King_Taxi_Cars-1.jpeg',
      description: 'Premium executive vehicle for business travel and special occasions.'
    },
    {
      id: 2,
      name: 'King Taxi Luxury',
      type: 'Luxury',
      image: '/King_Taxi_Cars-2.jpeg',
      description: 'Luxury comfort with advanced safety features and spacious interior.'
    }
  ];

  // Auto-rotate cars every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarIndex((prevIndex) => (prevIndex + 1) % featuredCars.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredCars.length]);


  const features = [
    'No hidden charges - transparent pricing',
    'Fixed rates for airport transfers',
    'Discounts for advance bookings',
    'Corporate account options available',
    'Multiple payment methods accepted',
    'Free waiting time for airport pickups',
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Our Services & Fleet
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transparent pricing and premium vehicles for all your transportation needs.
          </p>
        </motion.div>

        {/* Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Side - Fare Structure */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 flex-1 flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">Our Fare Structure</h3>
                <p className="text-gray-300 text-sm">
                  Transparent and competitive pricing for all your transportation needs
                </p>
              </div>
              
              <div className="flex-1 flex items-center justify-center mb-6">
                <div className="relative w-full h-80 flex items-center justify-center">
                  <Image
                    src="/fare_list.jpeg"
                    alt="King Taxi Fare List"
                    width={500}
                    height={400}
                    className="rounded-lg shadow-lg object-contain max-w-full max-h-full"
                  />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-300 text-xs mb-4">
                  *Prices may vary based on distance, time of day, and special requirements
                </p>
                <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                  <Link href="/book">
                    Book Your Ride
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Right Side - Fleet with Rotation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 flex-1 flex flex-col">
              <div className="text-center mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Our Fleet</h3>
                  <div className="flex space-x-2">
                    {featuredCars.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCarIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentCarIndex ? 'bg-red-600' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  Discover our modern, clean and reliable fleet of vehicles
                </p>
              </div>
              
              {/* Rotating Car Display */}
              <div className="flex-1 flex items-center justify-center mb-6">
                <motion.div
                  key={currentCarIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-80 overflow-hidden rounded-lg"
                >
                  <Image
                    src={featuredCars[currentCarIndex].image}
                    alt={featuredCars[currentCarIndex].name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600 text-white font-semibold px-3 py-1 rounded-full">
                      {featuredCars[currentCarIndex].type}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-xl font-bold text-white mb-2">
                      {featuredCars[currentCarIndex].name}
                    </h4>
                    <p className="text-gray-200 text-sm">
                      {featuredCars[currentCarIndex].description}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Fleet Features */}
              <div className="space-y-3 mb-6">
                <h4 className="text-lg font-bold text-white text-center mb-4">Fleet Features</h4>
                <div className="grid grid-cols-1 gap-2">
                  {features.slice(0, 4).map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                  <Link href="/gallery">
                    See More Cars
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Fare Calculator CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Calculator className="w-16 h-16 text-red-600 mb-6" />
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                  Get Your Fare Estimate
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Use our online fare calculator to get an instant estimate for your journey. 
                  Simply enter your pickup and destination points to see the cost.
                </p>
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/book">
                    Calculate Fare & Book
                    <Calculator className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-bold mb-6 text-white">Pricing Features</h4>
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
