import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // For admin user, check specific credentials
    if (email === 'admin@kingtaxi.co.uk') {
      if (password === 'Admin123') {
        return NextResponse.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          accountType: user.accountType,
          isApproved: user.isApproved,
          isActive: user.isActive,
          isAdmin: true,
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    }

    // For regular users, check if they have a password set
    if (!user.password) {
      return NextResponse.json(
        { error: 'Account not properly set up. Please contact support.' },
        { status: 401 }
      );
    }

    // Simple password comparison (in production, use bcrypt)
    if (user.password === password) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountType: user.accountType,
        isApproved: user.isApproved,
        isActive: user.isActive,
        isAdmin: false,
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    
    // Check if it's a database connection error or table doesn't exist
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
