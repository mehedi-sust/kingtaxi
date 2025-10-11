import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single fare
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fare = await prisma.fare.findUnique({
      where: { id }
    });

    if (!fare) {
      return NextResponse.json(
        { error: 'Fare not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(fare);
  } catch (error) {
    console.error('Error fetching fare:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fare' },
      { status: 500 }
    );
  }
}

// PUT - Update fare
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fromLocation, toLocation, vehicleType, price, isActive } = body;

    // Check if fare exists
    const existingFare = await prisma.fare.findUnique({
      where: { id }
    });

    if (!existingFare) {
      return NextResponse.json(
        { error: 'Fare not found' },
        { status: 404 }
      );
    }

    // Validation
    if (fromLocation && typeof fromLocation !== 'string') {
      return NextResponse.json(
        { error: 'Invalid fromLocation' },
        { status: 400 }
      );
    }

    if (toLocation && typeof toLocation !== 'string') {
      return NextResponse.json(
        { error: 'Invalid toLocation' },
        { status: 400 }
      );
    }

    if (vehicleType && !['FOUR_SEATER', 'EIGHT_SEATER'].includes(vehicleType)) {
      return NextResponse.json(
        { error: 'Invalid vehicle type' },
        { status: 400 }
      );
    }

    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Check for duplicate if route or vehicle type is being changed
    if (fromLocation || toLocation || vehicleType) {
      const checkFromLocation = fromLocation?.trim() || existingFare.fromLocation;
      const checkToLocation = toLocation?.trim() || existingFare.toLocation;
      const checkVehicleType = vehicleType || existingFare.vehicleType;

      const duplicateFare = await prisma.fare.findFirst({
        where: {
          fromLocation: checkFromLocation,
          toLocation: checkToLocation,
          vehicleType: checkVehicleType,
          id: { not: id }
        }
      });

      if (duplicateFare) {
        return NextResponse.json(
          { error: 'Fare already exists for this route and vehicle type' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (fromLocation !== undefined) updateData.fromLocation = fromLocation.trim();
    if (toLocation !== undefined) updateData.toLocation = toLocation.trim();
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (price !== undefined) updateData.price = parseFloat(price.toString());
    if (isActive !== undefined) updateData.isActive = isActive;

    const fare = await prisma.fare.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(fare);
  } catch (error) {
    console.error('Error updating fare:', error);
    return NextResponse.json(
      { error: 'Failed to update fare' },
      { status: 500 }
    );
  }
}

// DELETE fare
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if fare exists
    const existingFare = await prisma.fare.findUnique({
      where: { id }
    });

    if (!existingFare) {
      return NextResponse.json(
        { error: 'Fare not found' },
        { status: 404 }
      );
    }

    await prisma.fare.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Fare deleted successfully' });
  } catch (error) {
    console.error('Error deleting fare:', error);
    return NextResponse.json(
      { error: 'Failed to delete fare' },
      { status: 500 }
    );
  }
}