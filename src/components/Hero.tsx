'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MapPin, Clock, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Banner.jpg"
          alt="King Taxi Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20"
          >
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-white font-medium">Trusted by 10,000+ Customers</span>
          </motion.div>

          <div className="space-y-4">
            {/* Premium Taxi Service - smaller text above */}
            <motion.p
              className="text-xl md:text-2xl font-medium text-white/90"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Premium Taxi Service in Ashford, Kent
            </motion.p>
            
            {/* KING TAXI Logo */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Image
                src="/logo.jpeg"
                alt="King Taxi Ashford Logo"
                width={350}
                height={175}
                className="object-contain max-w-full h-auto"
                priority
              />
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl font-medium text-white/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Your Trusted Local Taxi Company
            </motion.p>
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed"
          >
            24/7 taxi service in Ashford & Kent • Airport transfers • CRB-checked drivers • Competitive fares
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12"
          >
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-10 py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-full shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
            >
              <Link href="/book" className="flex items-center space-x-2">
                <span>Book Your Ride Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="text-lg px-10 py-6 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:text-white font-semibold rounded-full shadow-xl hover:shadow-white/25 transition-all duration-300 hover:scale-105"
            >
              <Link href="tel:+4401233367357" className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Call Now: +44 01233 367 357</span>
              </Link>
            </Button>
          </motion.div>

          {/* Quick Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="bg-white/15 backdrop-blur-lg border-white/30 p-6 text-center hover:bg-white/20 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">24/7 Available</h3>
                <p className="text-gray-100 text-sm leading-relaxed">Round the clock service</p>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="bg-white/15 backdrop-blur-lg border-white/30 p-6 text-center hover:bg-white/20 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Ashford & Kent</h3>
                <p className="text-gray-100 text-sm leading-relaxed">Local & airport transfers</p>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="bg-white/15 backdrop-blur-lg border-white/30 p-6 text-center hover:bg-white/20 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Instant Booking</h3>
                <p className="text-gray-100 text-sm leading-relaxed">Online or by phone</p>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator - moved to right corner as floating overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="fixed bottom-8 right-8 z-50 pointer-events-none flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-16 border-2 border-gray-600 dark:border-white/60 rounded-full flex justify-center backdrop-blur-sm bg-white/90 dark:bg-white/10 p-2 shadow-lg"
        >
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-4 bg-gray-600 dark:bg-white rounded-full mt-1"
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="text-gray-700 dark:text-white/80 text-xs mt-2 text-center font-medium bg-white/90 dark:bg-transparent px-2 py-1 rounded backdrop-blur-sm"
        >
          Scroll to explore
        </motion.p>
      </motion.div>
    </section>
  );
}
