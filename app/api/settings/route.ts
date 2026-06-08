import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.setting.findMany();
    const result = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Process top-level keys as individual settings
    for (const [key, value] of Object.entries(data)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: value as any },
        create: { key, value: value as any },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
