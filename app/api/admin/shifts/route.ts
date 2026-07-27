import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const shifts = await prisma.shiftAvailability.findMany({
      include: { employee: true },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });
    return NextResponse.json(shifts);
  } catch (error) {
    console.error("Failed to fetch shifts", error);
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.employeeId || !data.date || !data.startTime || !data.endTime) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shift = await prisma.shiftAvailability.create({
      data: {
        employeeId: data.employeeId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime
      },
      include: { employee: true }
    });

    return NextResponse.json({ success: true, shift });
  } catch (error: any) {
    console.error("Failed to create shift", error);
    return NextResponse.json({ error: 'Failed to create shift', details: error.message }, { status: 500 });
  }
}
