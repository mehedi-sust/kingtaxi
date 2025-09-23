'use client';

import { motion } from 'framer-motion';
import { Users, Shield, Award, Clock, CheckCircle, Star, Car, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  const stats = [
    { number: '10+', label: 'Years of Experience' },
    { number: '50,000+', label: 'Happy Customers' },
    { number: '100+', label: 'Professional Drivers' },
    { number: '24/7', label: 'Service Available' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'All our drivers are CRB checked and our vehicles undergo regular safety inspections.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Clock,
      title: 'Punctuality',
      description: 'We value your time and ensure timely pickups and drop-offs for all our services.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Award,
      title: 'Quality Service',
      description: 'Committed to delivering the highest standard of service with clean, comfortable vehicles.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Users,
      title: 'Customer Focus',
      description: 'Your satisfaction is our priority. We listen to feedback and continuously improve.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const services = [
    'Corporate accounts and executive taxis',
    'Airport transfers to/from any UK airport',
    'Taxis with disabled access',
    'Minibuses for large groups',
    'Local and long-distance journeys',
    'Wedding and special event transport',
  ];

  const driverBenefits = [
    'Competitive rates and flexible working hours',
    'Full training and ongoing support provided',
    'Modern, well-maintained vehicle fleet',
    'Friendly and supportive work environment',
    'Opportunities for career advancement',
    'Regular vehicle maintenance included',
  ];

  return (
    <div className="pt-20 bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-red-600">King Taxi</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We started out with just a couple of cars, but over the years have built a modern fleet of vehicles. 
              Our commitment to quality, reliability, and customer satisfaction has made us a trusted name in transportation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                  We started out with just a couple of cars, but over the years have built a fleet of modern, 
                  clean and reliable vehicles. Our fleet offers passengers comfort, safety and security, 
                  with all vehicles regularly serviced and valeted every week.
                </p>
                <p>
                  We employ local people who are friendly and efficient at providing the best service. 
                  We offer much more than just a local Ashford taxi service. Be it corporate accounts, 
                  executive taxis, taxis with disabled access or minibuses for large groups, we can help.
                </p>
                <p>
                  And it's not just Ashford we cover. Our taxis can take you anywhere in the country 
                  and our airport transfers service can drop you off or collect you from any UK airport. 
                  London's largest private hire firms trust us to fulfill their taxi rides in and around the area.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-w-16 aspect-h-12 rounded-2xl overflow-hidden shadow-xl">
                <div
                  className="w-full h-96 bg-cover bg-center bg-no-repeat rounded-2xl"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
                  }}
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-red-600 text-white p-6 rounded-2xl shadow-xl">
                <Star className="w-8 h-8 mb-2" />
                <div className="text-2xl font-bold">4.9/5</div>
                <div className="text-sm opacity-90">Customer Rating</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These fundamental principles guide everything we do and shape the experience we deliver to our customers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${value.bgColor} rounded-full mb-6`}>
                  <value.icon className={`w-8 h-8 ${value.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Comprehensive Services
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We offer a wide range of transportation services to meet all your needs. 
                From individual rides to corporate accounts, we have you covered.
              </p>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Car className="w-12 h-12 text-red-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Modern Fleet</h3>
                <p className="text-gray-600 text-sm">
                  Clean, comfortable, and regularly maintained vehicles for your safety and comfort.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <MapPin className="w-12 h-12 text-red-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Wide Coverage</h3>
                <p className="text-gray-600 text-sm">
                  Serving Ashford and surrounding areas, plus airport transfers across the UK.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Drivers Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Professional Drivers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our drivers are trusted, helpful and knowledgeable, getting you to your destination 
              quickly and safely. They come from all backgrounds and are all CRB checked.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="aspect-w-16 aspect-h-12 rounded-2xl overflow-hidden shadow-xl">
                <div
                  className="w-full h-96 bg-cover bg-center bg-no-repeat rounded-2xl"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
                  }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Join Our Driving Team
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We're always looking for professional, reliable drivers to join our team. 
                We offer competitive rates, flexible hours, and a supportive work environment.
              </p>
              <div className="space-y-4 mb-8">
                {driverBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
              <Link
                href="/driver-application"
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg"
              >
                Apply to Drive with Us
                <Users className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

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
              Ready to Experience King Taxi?
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
              Book your ride today and discover why thousands of customers trust us 
              for their transportation needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              >
                Book Your Ride Now
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
