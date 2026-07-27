import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await prisma.employee.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete employee", error);
    return NextResponse.json({ error: 'Failed to delete employee', details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const updated = await prisma.employee.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        isActive: data.isActive,
      }
    });
    return NextResponse.json({ success: true, employee: updated });
  } catch (error: any) {
    console.error("Failed to update employee", error);
    return NextResponse.json({ error: 'Failed to update employee', details: error.message }, { status: 500 });
  }
}
