import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const types = await prisma.experienceType.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error("GET /api/experience-types ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch experience types', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Auto-generate slug if not provided
    const slug = data.slug || slugify(data.name);

    // Get highest order
    const highestOrder = await prisma.experienceType.findFirst({
      orderBy: { order: 'desc' },
    });
    const order = data.order !== undefined ? data.order : (highestOrder ? highestOrder.order + 1 : 1);
    
    const newType = await prisma.experienceType.create({
      data: {
        name: data.name,
        slug: slug,
        order: order
      },
    });
    
    return NextResponse.json(newType, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create experience type", error);
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A type with that name or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create experience type' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Expected an array of updates' }, { status: 400 });
    }

    // For batch updates like ordering
    const updates = data.map((type: any) => 
      prisma.experienceType.update({
        where: { id: type.id },
        data: { order: type.order }
      })
    );
    
    await prisma.$transaction(updates);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to batch update experience types' }, { status: 500 });
  }
}
