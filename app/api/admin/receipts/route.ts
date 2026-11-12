import { NextRequest, NextResponse } from 'next/server';
import { getEnrichedAccountingReceipts } from '@/lib/receipts';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const parsedLimit = limitParam ? parseInt(limitParam, 10) : undefined;
    const limit = parsedLimit && !Number.isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined;

    // STRICT ACCOUNTING FILTER (delegated to lib/receipts):
    // Only return genuine completed Vipps webshop vouchers (`CAPTURED` sales and `REFUNDED` credit notes).
    // Terminal/POS payments are booked in the physical POS register under Kassasystemloven and
    // intermediate webhook states (`CREATED`, `AUTHORIZED`, `EXPIRED`, `ABORTED`, `CANCELLED`)
    // belong exclusively in `WebhookLog`.
    const enrichedReceipts = await getEnrichedAccountingReceipts({
      order: 'desc',
      limit,
    });

    return NextResponse.json(enrichedReceipts);
  } catch (error) {
    console.error("Failed to fetch receipts", error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}
