import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const fares = await prisma.fare.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { vehicleType: 'asc' },
        { price: 'asc' }
      ]
    });

    return NextResponse.json(fares);
  } catch (error) {
    console.error('Error fetching fares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fares' },
      { status: 500 }
    );
  }
}