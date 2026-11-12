import { NextRequest, NextResponse } from 'next/server';
import {
  buildDailySettlementReport,
  generateDailySettlementCsv,
  generateReceiptDetailsCsv,
  getEnrichedAccountingReceipts,
} from '@/lib/receipts';

/**
 * Read-only daily Vipps settlement report grouped in Europe/Oslo timezone.
 * Supports JSON (default) and semicolon-delimited UTF-8 CSV (`?format=csv`).
 * Optional params: `scope=daily|receipts`, `date=YYYY-MM-DD`.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const format = (searchParams.get('format') || 'json').toLowerCase();
    const scope = (searchParams.get('scope') || 'daily').toLowerCase();
    const dateParam = searchParams.get('date');
    const validDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : null;

    const receiptsAsc = await getEnrichedAccountingReceipts({ order: 'asc' });
    const report = buildDailySettlementReport(receiptsAsc);

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
