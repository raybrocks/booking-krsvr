import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/store-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente butikkinnstillinger' },
      { status: 500 }
    );
  }
}

async function handleUpdate(req: NextRequest) {
  try {
    const body = await req.json();

    if (
      body.isVatRegistered !== undefined &&
      typeof body.isVatRegistered !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'isVatRegistered må være en boolsk verdi (true/false)' },
        { status: 400 }
      );
    }

    if (body.defaultVatRate !== undefined) {
      const rate = Number(body.defaultVatRate);
      if (!Number.isInteger(rate) || rate < 0 || rate > 100) {
        return NextResponse.json(
          { error: 'defaultVatRate må være et heltall mellom 0 og 100' },
          { status: 400 }
        );
      }
    }

    if (body.isVatRegistered === undefined && body.defaultVatRate === undefined) {
      return NextResponse.json(
        { error: 'Ingen gyldige innstillingsfelt oppgitt' },
        { status: 400 }
      );
    }

    const updated = await updateStoreSettings({
      isVatRegistered: body.isVatRegistered,
      defaultVatRate:
        body.defaultVatRate !== undefined ? Number(body.defaultVatRate) : undefined,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update /api/admin/settings error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke oppdatere butikkinnstillinger' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return handleUpdate(req);
}

export async function PATCH(req: NextRequest) {
  return handleUpdate(req);
}
