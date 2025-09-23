import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
