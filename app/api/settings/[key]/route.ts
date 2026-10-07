import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanupGeneralSettings } from '@/lib/settings';

export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: key },
    });
    
    if (!setting) {
      return NextResponse.json({ value: null });
    }

    const value = key === 'general' ? cleanupGeneralSettings(setting.value) : setting.value;
    
    return NextResponse.json(value);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  try {
    const data = await req.json();
    
    await prisma.setting.upsert({
      where: { key: key },
      update: { value: data },
      create: { key: key, value: data },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
