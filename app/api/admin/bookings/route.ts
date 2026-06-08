import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        experience: {
          select: { name: true }
        }
      }
    });

    // Formatting for frontend compatibility
    const formattedBookings = bookings.map(b => ({
      ...b,
      experienceName: b.experience?.name || b.experienceId
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error("Failed to fetch admin bookings", error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
