import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const drivers = await prisma.driverApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, mobile, address, experience, message } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !mobile || !address || !experience) {
      return NextResponse.json(
        { error: 'First name, last name, email, mobile, address, and experience are required' },
        { status: 400 }
      );
    }

    // Check if driver application already exists
    const existingApplication = await prisma.driverApplication.findUnique({
      where: { email },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Driver application with this email already exists' },
        { status: 409 }
      );
    }

    // Create new driver application
    const newApplication = await prisma.driverApplication.create({
      data: {
        firstName,
        lastName,
        email,
        mobile,
        address,
        experience,
        message: message || null,
        isApproved: false, // New applications need approval
      },
    });

    return NextResponse.json({
      id: newApplication.id,
      message: 'Driver application submitted successfully. We will review your application and contact you within 24 hours.',
    }, { status: 201 });

  } catch (error) {
    console.error('Driver application error:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error) {
      if (error.message.includes('connect') || 
          error.message.includes('does not exist') ||
          error.message.includes('P2021')) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, isApproved } = await request.json();
    
    const driver = await prisma.driverApplication.update({
      where: { id },
      data: { isApproved },
    });
    
    return NextResponse.json(driver);
  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 });
  }
}
