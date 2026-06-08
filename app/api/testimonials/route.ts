import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const activeOnly = searchParams.get('active_only') === 'true';

    const testimonials = await prisma.testimonial.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(testimonials);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (data.order === undefined) {
      const highestOrder = await prisma.testimonial.findFirst({
        orderBy: { order: 'desc' },
      });
      data.order = highestOrder ? highestOrder.order + 1 : 1;
    }
    const newTestimonial = await prisma.testimonial.create({ data });
    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Expected an array of updates' }, { status: 400 });
    }

    const updates = data.map((item: any) => 
      prisma.testimonial.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    );
    
    await prisma.$transaction(updates);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to batch update testimonials' }, { status: 500 });
  }
}
