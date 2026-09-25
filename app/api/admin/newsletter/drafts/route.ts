import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'newsletter_drafts' },
    });

    const drafts = setting?.value || [];
    return NextResponse.json({ drafts });
  } catch (error: any) {
    console.error('Error fetching newsletter drafts:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente utkast', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { drafts } = body;

    if (!Array.isArray(drafts)) {
      return NextResponse.json({ error: 'Ugyldig dataformat for utkast' }, { status: 400 });
    }

    const updated = await prisma.setting.upsert({
      where: { key: 'newsletter_drafts' },
      update: { value: drafts },
      create: { key: 'newsletter_drafts', value: drafts },
    });

    return NextResponse.json({ success: true, drafts: updated.value });
  } catch (error: any) {
    console.error('Error saving newsletter drafts:', error);
    return NextResponse.json(
      { error: 'Kunne ikke lagre utkast', details: error.message },
      { status: 500 }
    );
  }
}
