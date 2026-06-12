import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: todayStr
        },
        status: {
          notIn: ['cancelled', 'terminated', 'CANCELLED', 'TERMINATED']
        }
      },
      select: {
        date: true
      }
    });

    const uniqueDates = Array.from(new Set(bookings.map(b => b.date)));
    
    return NextResponse.json(uniqueDates);
  } catch (error) {
    console.error("Failed to fetch booked dates", error);
    return NextResponse.json({ error: 'Failed to fetch dates' }, { status: 500 });
  }
}
