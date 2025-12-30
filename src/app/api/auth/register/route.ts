import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, mobile, accountType, message, password } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'First name, last name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Validate and convert accountType
    const validAccountType = accountType === 'business' ? 'BUSINESS' : 'PERSONAL';

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password, // In production, this should be hashed
        mobile: mobile || null,
        accountType: validAccountType,
        message: message || null,
        isApproved: false, // New users need approval
        isActive: true,
      },
    });

    // Return user data (without password)
    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      accountType: newUser.accountType,
      isApproved: newUser.isApproved,
      isActive: newUser.isActive,
      message: 'User registered successfully. Your account is pending approval.',
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
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
