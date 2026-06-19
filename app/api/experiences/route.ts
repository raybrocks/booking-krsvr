import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const activeOnly = searchParams.get('active_only') === 'true';

    const experiences = await prisma.experience.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
      include: { experienceType: true }
    });
    
    return NextResponse.json(experiences);
  } catch (error) {
    console.error("GET /api/experiences ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch experiences', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Ensure order is provided, otherwise get max and add 1
    if (data.order === undefined) {
      const highestOrder = await prisma.experience.findFirst({
        orderBy: { order: 'desc' },
      });
      data.order = highestOrder ? highestOrder.order + 1 : 1;
    }
    
    if (data.experienceType) delete data.experienceType;
    if (data.id) delete data.id;
    
    const newExperience = await prisma.experience.create({
      data,
    });
    
    return NextResponse.json(newExperience, { status: 201 });
  } catch (error) {
    console.error("Failed to create experience", error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Expected an array of updates' }, { status: 400 });
    }

    // For batch updates like ordering
    const updates = data.map((exp: any) => 
      prisma.experience.update({
        where: { id: exp.id },
        data: { order: exp.order }
      })
    );
    
    await prisma.$transaction(updates);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to batch update experiences' }, { status: 500 });
  }
}
