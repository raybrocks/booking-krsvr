import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  buildDailySettlementReport,
  generateDailySettlementCsv,
  generateReceiptDetailsCsv,
  getEnrichedAccountingReceipts,
} from '@/lib/receipts';
import { getStoreSettings } from '@/lib/store-settings';
import { generateDailySettlementPdfBuffer } from '@/lib/daily-settlement-pdf';
import { dispatchDailySettlement } from '@/lib/daily-settlement-dispatch';

export const dynamic = 'force-dynamic';

/**
 * Daily Vipps settlement report grouped in Europe/Oslo timezone.
 * Supports JSON (default), semicolon-delimited UTF-8 CSV (`?format=csv`),
 * and accounting A4 PDF (`?format=pdf&date=YYYY-MM-DD`).
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const format = (searchParams.get('format') || 'json').toLowerCase();
    const scope = (searchParams.get('scope') || 'daily').toLowerCase();
    const dateParam = searchParams.get('date');
    const validDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : null;

    const [receiptsAsc, dispatches, storeSettings] = await Promise.all([
      getEnrichedAccountingReceipts({ order: 'asc' }),
      prisma.dailySettlementDispatch.findMany({
        orderBy: { settlementDate: 'asc' },
      }),
      getStoreSettings(),
    ]);

    const report = buildDailySettlementReport(receiptsAsc);

    if (format === 'pdf') {
      if (!validDate) {
        return NextResponse.json(
          { error: 'Mangler gyldig date-parameter (YYYY-MM-DD) for PDF' },
          { status: 400 }
        );
      }
      const targetDay = report.days.find((d) => d.date === validDate);
      if (!targetDay) {
        return NextResponse.json(
          { error: `Fant ingen dagsoppgjørsbilag for dato ${validDate}` },
          { status: 404 }
        );
      }

      const pdfBuffer = await generateDailySettlementPdfBuffer(targetDay, storeSettings);
      const filename = `Dagsoppgjor_${targetDay.settlementCode}_${targetDay.date}.pdf`;

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    if (format === 'csv') {
      const wantsReceipts = scope === 'receipts' || Boolean(validDate);
      const csvContent = wantsReceipts
        ? generateReceiptDetailsCsv(report, validDate)
        : generateDailySettlementCsv(report);

      const todayStr = new Date().toISOString().split('T')[0];
      const filename = validDate
        ? `vipps-kvitteringer-${validDate}.csv`
        : wantsReceipts
        ? `vipps-enkeltkvitteringer-${todayStr}.csv`
        : `vipps-dagsoppgjor-${todayStr}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const selectedDay = validDate
      ? report.days.find((d) => d.date === validDate) || null
      : null;

    return NextResponse.json({
      ...report,
      dispatches,
      voucherEmail: storeSettings.voucherEmail || null,
      ...(validDate ? { selectedDay } : {}),
    });
  } catch (error) {
    console.error('Failed to build daily settlement report:', error);
    return NextResponse.json(
      { error: 'Kunne ikke generere dagsoppgjørsrapport' },
      { status: 500 }
    );
  }
}

/**
 * Manually dispatches (or resends) a single daily settlement PDF to `StoreSettings.voucherEmail`.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const date = typeof body?.date === 'string' ? body.date.trim() : '';
    const forceResend = Boolean(body?.forceResend);

    if (!date) {
      return NextResponse.json({ error: 'Dato mangler' }, { status: 400 });
    }

    const result = await dispatchDailySettlement({ date, forceResend });
    if (result.status === 'failed') {
      return NextResponse.json({ error: result.reason || 'Sending feilet', result }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('POST /api/admin/receipts/daily-summary error:', error);
    return NextResponse.json(
      { error: error?.message || 'Kunne ikke sende dagsoppgjør' },
      { status: 500 }
    );
  }
}
