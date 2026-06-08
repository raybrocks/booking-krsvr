import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await req.json();
    
    // Remove complex fields
    if (data.id) delete data.id;
    if (data.experience) delete data.experience;
    if (data.experienceName) delete data.experienceName;
    if (data.createdAt) delete data.createdAt;
    if (data.updatedAt) delete data.updatedAt;

    const updatedBooking = await prisma.booking.update({
      where: { id: id },
      data,
    });

    // Also cascade status update to shadow bookings 
    if (data.status) {
       await prisma.booking.updateMany({
         where: { parentBookingId: id },
         data: { status: data.status }
       });
    }
    
    return NextResponse.json(updatedBooking);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Delete child bookings first
    await prisma.booking.deleteMany({
      where: { parentBookingId: id }
    });

    await prisma.booking.delete({
      where: { id: id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
