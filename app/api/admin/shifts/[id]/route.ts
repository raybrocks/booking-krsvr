import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await prisma.shiftAvailability.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete shift", error);
    return NextResponse.json({ error: 'Failed to delete shift', details: error.message }, { status: 500 });
  }
}
