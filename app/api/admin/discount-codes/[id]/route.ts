import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await req.json();
    
    const updateData: any = {};
    if (data.code !== undefined) updateData.code = data.code.toUpperCase();
    if (data.discount !== undefined) updateData.discount = parseFloat(data.discount);
    if (data.type !== undefined) updateData.type = data.type;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;
    
    const updatedCode = await prisma.discountCode.update({
      where: { id: id },
      data: updateData,
    });
    
    return NextResponse.json(updatedCode);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update discount code' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.discountCode.delete({
      where: { id: id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete discount code' }, { status: 500 });
  }
}
