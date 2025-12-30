import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [userCount, driverCount, offerCount] = await Promise.all([
      prisma.user.count(),
      prisma.driverApplication.count(),
      prisma.offer.count({ where: { isActive: true } }),
    ]);

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const recentDrivers = await prisma.driverApplication.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      stats: {
        totalUsers: userCount,
        totalDrivers: driverCount,
        activeOffers: offerCount,
      },
      recentUsers,
      recentDrivers,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
