'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Reviews() {
  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent service! The driver was punctual, professional, and the car was spotless. Will definitely use King Taxi again for my airport transfers.',
      date: '2 weeks ago',
      verified: true,
    },
    {
      id: 2,
      name: 'Michael Brown',
      rating: 5,
      comment: 'Outstanding experience from booking to drop-off. The online booking system is user-friendly, and the driver was courteous and knowledgeable about the area.',
      date: '1 month ago',
      verified: true,
    },
    {
      id: 3,
      name: 'Emma Wilson',
      rating: 5,
      comment: 'King Taxi saved the day when my flight was delayed. The driver waited patiently without extra charges. Truly reliable service!',
      date: '3 weeks ago',
      verified: true,
    },
    {
      id: 4,
      name: 'David Miller',
      rating: 5,
      comment: 'Used King Taxi for a business trip. The executive car was luxurious and comfortable. Professional service that I would highly recommend.',
      date: '1 week ago',
      verified: true,
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      rating: 5,
      comment: 'Great value for money! Clean vehicles, friendly drivers, and always on time. My go-to taxi service in the area.',
      date: '2 months ago',
      verified: true,
    },
    {
      id: 6,
      name: 'James Taylor',
      rating: 5,
      comment: 'Booked a minibus for our group outing. Spacious, comfortable, and the driver was very accommodating. Excellent service overall.',
      date: '3 weeks ago',
      verified: true,
    },
  ];

  const stats = [
    { number: '10+', label: 'Years of Service' },
    { number: '50,000+', label: 'Happy Customers' },
    { number: '4.9/5', label: 'Average Rating' },
    { number: '24/7', label: 'Service Available' },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our valued customers have to say about 
            their experience with King Taxi.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 relative"
            >
              <Quote className="w-8 h-8 text-red-600 opacity-20 absolute top-4 right-4" />
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {review.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{review.name}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    {review.verified && (
                      <span className="text-xs text-green-600 font-medium">Verified</span>
                    )}
                  </div>
                </div>
              </div>
              
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              &ldquo;{review.comment}&rdquo;
            </p>
              
              <div className="text-sm text-gray-400 dark:text-gray-500">
                {review.date}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Join Thousands of Satisfied Customers
            </h3>
            <p className="text-red-100 mb-8 max-w-2xl mx-auto">
              Experience the same exceptional service that has earned us countless 5-star reviews. 
              Book your ride today and see why customers choose King Taxi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/book"
                className="bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              >
                Book Your Ride Now
              </a>
              <a
                href="tel:+4401233367357"
                className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                Call: +44 01233 367 357
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
