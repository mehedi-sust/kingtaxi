import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all fares (including inactive ones for admin)
export async function GET() {
  try {
    const fares = await prisma.fare.findMany({
      orderBy: [
        { vehicleType: 'asc' },
        { fromLocation: 'asc' },
        { toLocation: 'asc' }
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

// POST - Create new fare
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromLocation, toLocation, vehicleType, price, isActive = true } = body;

    // Validation
    if (!fromLocation || !toLocation || !vehicleType || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['FOUR_SEATER', 'EIGHT_SEATER'].includes(vehicleType)) {
      return NextResponse.json(
        { error: 'Invalid vehicle type' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Check for duplicate fare
    const existingFare = await prisma.fare.findFirst({
      where: {
        fromLocation: fromLocation.trim(),
        toLocation: toLocation.trim(),
        vehicleType
      }
    });

    if (existingFare) {
      return NextResponse.json(
        { error: 'Fare already exists for this route and vehicle type' },
        { status: 409 }
      );
    }

    const fare = await prisma.fare.create({
      data: {
        fromLocation: fromLocation.trim(),
        toLocation: toLocation.trim(),
        vehicleType,
        price: parseFloat(price.toString()),
        isActive
      }
    });

    return NextResponse.json(fare, { status: 201 });
  } catch (error) {
    console.error('Error creating fare:', error);
    return NextResponse.json(
      { error: 'Failed to create fare' },
      { status: 500 }
    );
  }
}