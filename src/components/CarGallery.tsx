'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CarGallery() {
  // Using actual car images from public folder
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
    },
    {
      id: 3,
      name: 'King Taxi Standard',
      type: 'Standard',
      image: '/King_Taxi_Cars-3.jpeg',
      description: 'Reliable and comfortable vehicle for all your transportation needs.'
    },
    {
      id: 4,
      name: 'King Taxi Group',
      type: 'Group Travel',
      image: '/King_Taxi_Cars-4.jpeg',
      description: 'Spacious vehicle perfect for group travel and airport transfers.'
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-red-600 text-white rounded-full px-6 py-3 mb-8"
          >
            <Car className="w-5 h-5" />
            <span className="font-semibold">Our Premium Fleet</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
            Our Fleet
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Discover our modern, clean and reliable fleet of vehicles. From executive cars to 
            group transport, we have the perfect vehicle for your journey.
          </p>
        </motion.div>

        {/* Featured Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {featuredCars.map((car, index) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-800 border-0 shadow-xl group-hover:shadow-red-500/20">
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={car.image}
                    alt={car.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-colors duration-300" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600 text-white font-semibold px-3 py-1 rounded-full">
                      {car.type}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300 font-bold">
                    {car.name}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {car.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-12 md:p-16 border-0 shadow-2xl">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <Car className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              See Our Complete Fleet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto text-lg leading-relaxed">
              Explore our full range of vehicles including executive cars, family vehicles, 
              eco-friendly options, and group transport solutions.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-10 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/gallery" className="flex items-center space-x-2">
                <span>View Full Gallery</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
