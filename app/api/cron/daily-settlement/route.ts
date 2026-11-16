import { NextResponse } from 'next/server';
import { dispatchPendingDailySettlementsForCron } from '@/lib/daily-settlement-dispatch';

export const dynamic = 'force-dynamic';

/**
 * Nightly Vercel Cron (`0 1 * * *` UTC = 02:00 CET / 03:00 CEST)
 * Automatically sends PDF daily settlement vouchers for closed Oslo calendar days
 * to the configured accounting voucher email (`StoreSettings.voucherEmail`).
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const summary = await dispatchPendingDailySettlementsForCron();
    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error: any) {
    console.error('Error in daily-settlement cron:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
