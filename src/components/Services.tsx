'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Users, Shield, Clock, Star, ArrowRight } from 'lucide-react';
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

  const features = [
    'Trusted, helpful and knowledgeable drivers',
    'Modern, clean and reliable fleet',
    'Getting you to your destination quickly and safely',
    'Unbeatable prices and excellent customer service',
    'CRB checked drivers from various backgrounds',
    'Regular vehicle servicing and weekly valeting',
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
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
            className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full px-6 py-3 mb-8"
          >
            <Star className="w-5 h-5" />
            <span className="font-semibold">Our Core Values</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Our Key Services
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            King Taxi's four key service areas are unbeatable. There is no compromise in Quality, 
            Reliability, Punctuality and Availability. These are our highest priorities.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
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
                <CardHeader className="p-6 flex-shrink-0">
                  <motion.div 
                    className={`inline-flex items-center justify-center w-16 h-16 ${service.bgColor} rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300`}
                    whileHover={{ rotate: 3 }}
                  >
                    <service.icon className={`w-8 h-8 ${service.color}`} />
                  </motion.div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-3">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex flex-col flex-grow">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-sm flex-grow">{service.description}</p>
                  <Button 
                    variant="link" 
                    asChild 
                    className="p-0 h-auto text-red-600 dark:text-red-400 font-semibold hover:text-red-700 dark:hover:text-red-300 group-hover:translate-x-1 transition-transform duration-300 text-sm self-start"
                  >
                    <Link href="/book" className="flex items-center space-x-1">
                      <span>Book Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 md:p-16 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full px-4 py-2 mb-6"
                >
                  <Star className="w-4 h-4" />
                  <span className="font-semibold text-sm">Why Choose Us</span>
                </motion.div>
                <h3 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
                  Why Choose King Taxi?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-10 leading-relaxed text-lg">
                  We are committed to deliver the highest standard in our services ensuring you are 
                  safe and comfortable while onboard, offering unbeatable prices and excellent customer services.
                </p>
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-4 group"
                    >
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white p-10 shadow-2xl border-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                    <div className="relative z-10">
                      <h4 className="text-3xl font-bold mb-6">Ready to Book?</h4>
                      <p className="mb-8 opacity-90 text-lg leading-relaxed">
                        Experience our premium taxi service today. Book now for a comfortable and reliable journey.
                      </p>
                      <Button 
                        variant="secondary" 
                        asChild 
                        className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Link href="/book" className="flex items-center space-x-2">
                          <span>Book Your Taxi Now</span>
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
