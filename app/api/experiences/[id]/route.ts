import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const experience = await prisma.experience.findUnique({
      where: { id: id },
    });
    
    if (!experience) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(experience);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch experience' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await req.json();
    
    // Remove system fields if present so Prisma doesn't complain
    if (data.id) delete data.id;
    if (data.createdAt) delete data.createdAt;
    if (data.updatedAt) delete data.updatedAt;
    
    const updatedExperience = await prisma.experience.update({
      where: { id: id },
      data,
    });
    
    return NextResponse.json(updatedExperience);
  } catch (error) {
    console.error("Failed to update experience:", error);
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.experience.delete({
      where: { id: id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
  }
}
