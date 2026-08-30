import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const data = await request.json();

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;
    if (data.bookingId !== undefined) updateData.bookingId = data.bookingId;

    const updated = await prisma.contactInquiry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    await prisma.contactInquiry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}
