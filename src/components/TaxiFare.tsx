'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calculator, MapPin, Clock, Users, Plane, Car } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TaxiFare() {
  const fareOptions = [
    {
      title: 'Local Journeys',
      icon: MapPin,
      description: 'Short distance trips within the city',
      basePrice: '£3.50',
      perMile: '£2.20',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Airport Transfers',
      icon: Plane,
      description: 'Reliable transfers to/from all UK airports',
      basePrice: 'From £45',
      perMile: 'Fixed rates',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Long Distance',
      icon: Car,
      description: 'Comfortable journeys across the UK',
      basePrice: '£5.00',
      perMile: '£1.80',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Group Travel',
      icon: Users,
      description: 'Minibus for groups up to 8 passengers',
      basePrice: '£8.00',
      perMile: '£2.50',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const features = [
    'No hidden charges - transparent pricing',
    'Fixed rates for airport transfers',
    'Discounts for advance bookings',
    'Corporate account options available',
    'Multiple payment methods accepted',
    'Free waiting time for airport pickups',
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
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
            Taxi Fare Calculator
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transparent and competitive pricing for all your transportation needs. 
            Get an instant estimate for your journey.
          </p>
        </motion.div>

        {/* Fare List Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Our Fare Structure</h3>
            <div className="relative max-w-4xl mx-auto">
              <Image
                src="/fare_list.jpeg"
                alt="King Taxi Fare List"
                width={800}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
            <p className="text-gray-300 mt-4 text-sm">
              *Prices may vary based on distance, time of day, and special requirements
            </p>
          </Card>
        </motion.div>

        {/* Fare Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {fareOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${option.bgColor} rounded-full mb-2`}>
                    <option.icon className={`w-6 h-6 ${option.color}`} />
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <p className="text-gray-300 text-sm">{option.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Base fare:</span>
                      <Badge variant="outline" className="text-red-400 border-red-400">
                        {option.basePrice}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Per mile:</span>
                      <Badge variant="outline" className="text-red-400 border-red-400">
                        {option.perMile}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Fare Calculator CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
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

        {/* Special Offers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 text-center border-0">
            <Clock className="w-12 h-12 mx-auto mb-4" />
            <h4 className="text-xl font-bold mb-2">Early Bird Discount</h4>
            <p className="text-red-100 mb-4">Book 24 hours in advance and save 10% on your fare</p>
            <Button variant="secondary" asChild>
              <Link href="/book">
                Book in Advance
              </Link>
            </Button>
          </Card>
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center border-0">
            <Users className="w-12 h-12 mx-auto mb-4" />
            <h4 className="text-xl font-bold mb-2">Corporate Accounts</h4>
            <p className="text-blue-100 mb-4">Special rates for businesses and regular customers</p>
            <Button variant="secondary" asChild>
              <Link href="/contact">
                Learn More
              </Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
