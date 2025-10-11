import { PrismaClient, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kingtaxi.co.uk' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@kingtaxi.co.uk',
      mobile: '+44 20 1234 5678',
      accountType: 'BUSINESS',
      message: 'Default admin user',
      isApproved: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample offers
  const offers = [
    {
      title: 'New Customer Discount',
      description: 'Get 20% off your first ride with King Taxi',
      discount: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
    },
    {
      title: 'Airport Transfer Special',
      description: 'Fixed rate airport transfers with 15% discount',
      discount: 15,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      isActive: true,
    },
    {
      title: 'Business Account Bonus',
      description: 'Corporate accounts get 25% off all rides',
      discount: 25,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      isActive: true,
    },
  ];

  for (const offer of offers) {
    await prisma.offer.create({
      data: offer,
    });
  }

  console.log('✅ Sample offers created');

  // Create sample car images
  const carImages = [
    {
      url: '/King_Taxi_Cars-1.jpeg',
      alt: 'King Taxi Premium Vehicle',
      description: 'Premium executive vehicle for business travel',
      isActive: true,
    },
    {
      url: '/King_Taxi_Cars-2.jpeg',
      alt: 'King Taxi Luxury Vehicle',
      description: 'Luxury comfort with advanced safety features',
      isActive: true,
    },
    {
      url: '/King_Taxi_Cars-3.jpeg',
      alt: 'King Taxi Standard Vehicle',
      description: 'Reliable and comfortable standard vehicle',
      isActive: true,
    },
    {
      url: '/King_Taxi_Cars-4.jpeg',
      alt: 'King Taxi Family Vehicle',
      description: 'Spacious vehicle perfect for family trips',
      isActive: true,
    },
    {
      url: '/King_Taxi_Cars-5.jpeg',
      alt: 'King Taxi Group Vehicle',
      description: 'Large vehicle for group transportation',
      isActive: true,
    },
  ];

  for (const image of carImages) {
    await prisma.carImage.create({
      data: image,
    });
  }

  console.log('✅ Sample car images created');

  // Create sample reviews
  const reviews = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent service! Professional driver and clean vehicle. Highly recommended.',
      isApproved: true,
    },
    {
      name: 'Michael Brown',
      rating: 5,
      comment: 'Always on time and very reliable. Great for airport transfers.',
      isApproved: true,
    },
    {
      name: 'Emma Wilson',
      rating: 4,
      comment: 'Good service overall. Driver was friendly and knowledgeable about the area.',
      isApproved: true,
    },
    {
      name: 'David Smith',
      rating: 5,
      comment: 'Outstanding customer service. Will definitely use again.',
      isApproved: true,
    },
    {
      name: 'Lisa Davis',
      rating: 5,
      comment: 'Clean, comfortable vehicles and professional drivers. Perfect for business trips.',
      isApproved: true,
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }

  console.log('✅ Sample reviews created');

  // Create fare data from the image
  const fares = [
    // 4 Seater fares
    {
      fromLocation: 'Ashford',
      toLocation: 'Gatwick',
      vehicleType: VehicleType.FOUR_SEATER,
      price: 110,
      isActive: true,
    },
    {
      fromLocation: 'Ashford',
      toLocation: 'Heathrow',
      vehicleType: VehicleType.FOUR_SEATER,
      price: 150,
      isActive: true,
    },
    {
      fromLocation: 'Ashford',
      toLocation: 'Standsted',
      vehicleType: VehicleType.FOUR_SEATER,
      price: 150,
      isActive: true,
    },
    {
      fromLocation: 'Ashford',
      toLocation: 'Luton',
      vehicleType: VehicleType.FOUR_SEATER,
      price: 180,
      isActive: true,
    },
    // 8 Seater fares
    {
      fromLocation: 'Ashford',
      toLocation: 'Gatwick',
      vehicleType: VehicleType.EIGHT_SEATER,
      price: 140,
      isActive: true,
    },
    {
      fromLocation: 'Ashford',
      toLocation: 'Heathrow',
      vehicleType: VehicleType.EIGHT_SEATER,
      price: 190,
      isActive: true,
    },
    {
      fromLocation: 'Ashford',
      toLocation: 'Standsted',
      vehicleType: VehicleType.EIGHT_SEATER,
      price: 195,
      isActive: true,
    },
    {
      fromLocation: 'Ashford',
      toLocation: 'Luton',
      vehicleType: VehicleType.EIGHT_SEATER,
      price: 240,
      isActive: true,
    },
  ];

  for (const fare of fares) {
    await prisma.fare.create({
      data: fare,
    });
  }

  console.log('✅ Sample fares created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
