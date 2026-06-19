import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await req.json();
    
    if (data.id) delete data.id;
    if (data.createdAt) delete data.createdAt;
    if (data.updatedAt) delete data.updatedAt;

    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }
    
    const updatedType = await prisma.experienceType.update({
      where: { id: id },
      data,
    });
    
    // Cascade the name change to all experiences linked to this type
    if (data.name) {
      await prisma.experience.updateMany({
        where: { typeId: id },
        data: { type: data.name }
      });
    }
    
    return NextResponse.json(updatedType);
  } catch (error: any) {
    console.error("Failed to update experience type:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A type with that name or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update experience type' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Check if any experiences are using this type
    const experiencesCount = await prisma.experience.count({
      where: { typeId: id }
    });

    if (experiencesCount > 0) {
      return NextResponse.json({ error: `Cannot delete type: ${experiencesCount} experience(s) are currently using it.` }, { status: 400 });
    }

    await prisma.experienceType.delete({
      where: { id: id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete experience type:", error);
    return NextResponse.json({ error: 'Failed to delete experience type' }, { status: 500 });
  }
}
