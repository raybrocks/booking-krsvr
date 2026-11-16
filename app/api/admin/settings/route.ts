import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings, isValidIsoDate, updateStoreSettings } from '@/lib/store-settings';

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

    if (body.vatThresholdPassedDate !== undefined) {
      if (body.vatThresholdPassedDate !== null && typeof body.vatThresholdPassedDate !== 'string') {
        return NextResponse.json(
          { error: 'vatThresholdPassedDate må være en datostreng (YYYY-MM-DD) eller null' },
          { status: 400 }
        );
      }
      if (typeof body.vatThresholdPassedDate === 'string') {
        const trimmedDate = body.vatThresholdPassedDate.trim();
        if (trimmedDate.length > 0 && !isValidIsoDate(trimmedDate)) {
          return NextResponse.json(
            { error: 'Ugyldig dato for passert MVA-grense (bruk ÅÅÅÅ-MM-DD)' },
            { status: 400 }
          );
        }
      }
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

    if (body.voucherEmail !== undefined) {
      if (body.voucherEmail !== null && typeof body.voucherEmail !== 'string') {
        return NextResponse.json(
          { error: 'voucherEmail må være en tekststreng eller null' },
          { status: 400 }
        );
      }
      if (typeof body.voucherEmail === 'string') {
        const trimmed = body.voucherEmail.trim();
        if (trimmed.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          return NextResponse.json(
            { error: 'Ugyldig e-postadresse for bilag' },
            { status: 400 }
          );
        }
      }
    }

    if (
      body.vatThresholdPassedDate === undefined &&
      body.defaultVatRate === undefined &&
      body.voucherEmail === undefined
    ) {
      return NextResponse.json(
        { error: 'Ingen gyldige innstillingsfelt oppgitt' },
        { status: 400 }
      );
    }

    const updated = await updateStoreSettings({
      vatThresholdPassedDate: body.vatThresholdPassedDate,
      defaultVatRate:
        body.defaultVatRate !== undefined ? Number(body.defaultVatRate) : undefined,
      voucherEmail: body.voucherEmail,
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
