'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Users, Shield, Clock, Star, ArrowRight, Car, MapPin, Calendar, Plane, Camera, ShoppingBag, UserCheck, Globe, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Services() {
  const services = [
    {
      title: 'Quality',
      description: "King Taxi's Drivers outfit, Behaviours, Cleanliness, Attitude are in our quality list. We are very serious in complying with this standard.",
      icon: Star,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Punctuality',
      description: 'Time is most valuable to us. We try to deliver our services on time. But exception is when there is a traffic jam or any other disruptions caused delays.',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Reliability',
      description: 'Your trust is our motto. We show respect, dignity and flexibility to grow our reliability. Your feedback is important to us.',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Availability',
      description: 'We have huge range of available cars that meet your requirements anytime. But there is no guarantee in the busy season. So better to book in advance.',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const comprehensiveServices = [
    {
      title: 'CRB Qualified Drivers',
      description: 'All our drivers are CRB checked and professionally trained to ensure your safety and comfort.',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'UK-Wide Taxi Service',
      description: 'Comprehensive taxi service coverage across the entire United Kingdom for all your travel needs.',
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '24x7 Taxi Service',
      description: 'Round-the-clock availability ensuring you can book a taxi anytime, day or night.',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Event Booking',
      description: 'Special event transportation for weddings, parties, corporate events, and special occasions.',
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      title: 'Airport Transfer',
      description: 'Reliable airport pickup and drop-off services with flight monitoring and meet & greet options.',
      icon: Plane,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Sightseeing Tours',
      description: 'Guided sightseeing tours and tourist transportation to explore local attractions and landmarks.',
      icon: Camera,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Shopping Trips',
      description: 'Convenient transportation for shopping trips with waiting time and multiple stop options.',
      icon: ShoppingBag,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Local & Long Distance',
      description: 'Both local city rides and long-distance intercity travel with comfortable vehicles.',
      icon: MapPin,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
  ];

  const features = [
    'CRB checked and professionally trained drivers',
    'Modern, clean and well-maintained fleet',
    'GPS tracking and real-time journey monitoring',
    'Competitive pricing with transparent fare structure',
    'Multiple vehicle types: saloon, estate, MPV, and executive cars',
    'Advanced booking system with instant confirmation',
    'Meet & greet service for airport transfers',
    'Child seats and wheelchair accessible vehicles available',
    'Corporate accounts and business travel solutions',
    'Emergency and urgent ride services',
    'Multi-stop journeys and waiting time options',
    'Professional uniformed drivers with local knowledge',
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full px-6 py-2 mb-6"
          >
            <Star className="w-4 h-4" />
            <span className="font-semibold text-sm">Why Choose King Taxi Ashford</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Our Core Values
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Quality, Reliability, Punctuality and Availability - our highest priorities for taxi service in Ashford.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group flex"
            >
              <Card className="hover:shadow-xl transition-all duration-300 flex flex-col bg-white dark:bg-gray-800 border-0 shadow-md group-hover:shadow-red-500/10 w-full">
                <CardHeader className="p-5 flex-shrink-0">
                  <motion.div 
                    className={`inline-flex items-center justify-center w-12 h-12 ${service.bgColor} rounded-xl mb-3 group-hover:scale-105 transition-transform duration-300`}
                    whileHover={{ rotate: 3 }}
                  >
                    <service.icon className={`w-6 h-6 ${service.color}`} />
                  </motion.div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-2">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 flex flex-col flex-grow">
                  <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed text-sm flex-grow">{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Comprehensive Services Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Taxi Services in Ashford & Kent
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From airport transfers to local rides, we provide comprehensive taxi services across Ashford and Kent.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comprehensiveServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
                className="group flex"
              >
                <Card className="hover:shadow-lg transition-all duration-300 flex flex-col bg-white dark:bg-gray-800 border-0 shadow-sm group-hover:shadow-blue-500/10 w-full">
                  <CardHeader className="p-4 flex-shrink-0">
                    <motion.div 
                      className={`inline-flex items-center justify-center w-10 h-10 ${service.bgColor} rounded-lg mb-2 group-hover:scale-105 transition-transform duration-300`}
                      whileHover={{ rotate: 3 }}
                    >
                      <service.icon className={`w-5 h-5 ${service.color}`} />
                    </motion.div>
                    <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">{service.title}</CardTitle>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 bg-gradient-to-br from-red-600 to-red-700 text-white border-0 shadow-xl">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Book Your Ashford Taxi Now</h3>
              <p className="mb-6 opacity-90 text-base max-w-2xl mx-auto">
                CRB-checked drivers • Competitive fares • 24/7 availability • Instant confirmation
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  asChild 
                  className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-8 py-3 text-base rounded-full shadow-lg hover:scale-105 transition-all"
                >
                  <Link href="/book" className="flex items-center space-x-2">
                    <span>Book Online</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild 
                  className="border-2 border-white text-white hover:bg-white hover:text-red-600 font-semibold px-8 py-3 text-base rounded-full transition-all"
                >
                  <Link href="tel:+4401233367357" className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>01233 367 357</span>
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
