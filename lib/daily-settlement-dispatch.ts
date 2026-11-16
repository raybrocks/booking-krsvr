import { prisma } from '@/lib/prisma';
import {
  buildDailySettlementReport,
  getEnrichedAccountingReceipts,
  type DailySettlementDay,
} from '@/lib/receipts';
import { getStoreSettings, isValidIsoDate } from '@/lib/store-settings';
import { getTodayOslo } from '@/lib/settings';
import { generateDailySettlementPdfBuffer } from '@/lib/daily-settlement-pdf';
import { sendDailySettlementVoucherEmail } from '@/lib/email';

/**
 * Automated nightly Vercel Cron only auto-dispatches days from this date onward,
 * keeping historical settlements (DO-101..DO-126) under explicit staged approval.
 */
export const AUTO_CRON_START_DATE = '2026-11-16';

export interface DispatchSingleResult {
  date: string;
  settlementCode: string;
  status: 'sent' | 'skipped' | 'failed';
  recipientEmail?: string;
  resendEmailId?: string | null;
  reason?: string;
}

export async function dispatchDailySettlement(params: {
  date: string;
  forceResend?: boolean;
  recipientOverride?: string;
}): Promise<DispatchSingleResult> {
  const { date, forceResend = false, recipientOverride } = params;

  if (!isValidIsoDate(date)) {
    return {
      date,
      settlementCode: '',
      status: 'failed',
      reason: 'Ugyldig datoformat (bruk ÅÅÅÅ-MM-DD)',
    };
  }

  const [storeSettings, receiptsAsc, existingDispatch] = await Promise.all([
    getStoreSettings(),
    getEnrichedAccountingReceipts({ order: 'asc' }),
    prisma.dailySettlementDispatch.findUnique({
      where: { settlementDate: date },
    }),
  ]);

  const report = buildDailySettlementReport(receiptsAsc);
  const day: DailySettlementDay | undefined = report.days.find((d) => d.date === date);

  if (!day) {
    return {
      date,
      settlementCode: '',
      status: 'failed',
      reason: `Fant ingen bokføringsbilag på dato ${date}`,
    };
  }

  if (existingDispatch?.status === 'sent' && !forceResend) {
    return {
      date,
      settlementCode: day.settlementCode,
      status: 'skipped',
      recipientEmail: existingDispatch.recipientEmail,
      resendEmailId: existingDispatch.resendEmailId,
      reason: 'Allerede sendt til bilags-e-post',
    };
  }

  const recipient = (recipientOverride || storeSettings.voucherEmail || '').trim();
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    return {
      date,
      settlementCode: day.settlementCode,
      status: 'failed',
      reason: 'Mangler gyldig e-postadresse for bilag i Innstillinger',
    };
  }

  const pdfBuffer = await generateDailySettlementPdfBuffer(day, storeSettings);
  const sendResult = await sendDailySettlementVoucherEmail({
    to: recipient,
    day,
    pdfBuffer,
  });

  if (sendResult.error) {
    await prisma.dailySettlementDispatch.upsert({
      where: { settlementDate: date },
      update: {
        settlementNumber: day.settlementNumber,
        settlementCode: day.settlementCode,
        firstReceiptNumber: day.firstReceiptNumber,
        lastReceiptNumber: day.lastReceiptNumber,
        receiptCount: day.receiptCount,
        netTurnover: day.netTurnover,
        outgoingVat: day.outgoingVat,
        vippsFee: day.vippsFee,
        recipientEmail: recipient,
        status: 'failed',
        errorMessage: sendResult.error,
      },
      create: {
        settlementDate: date,
        settlementNumber: day.settlementNumber,
        settlementCode: day.settlementCode,
        firstReceiptNumber: day.firstReceiptNumber,
        lastReceiptNumber: day.lastReceiptNumber,
        receiptCount: day.receiptCount,
        netTurnover: day.netTurnover,
        outgoingVat: day.outgoingVat,
        vippsFee: day.vippsFee,
        recipientEmail: recipient,
        status: 'failed',
        errorMessage: sendResult.error,
      },
    });

    return {
      date,
      settlementCode: day.settlementCode,
      status: 'failed',
      recipientEmail: recipient,
      reason: sendResult.error,
    };
  }

  await prisma.dailySettlementDispatch.upsert({
    where: { settlementDate: date },
    update: {
      settlementNumber: day.settlementNumber,
      settlementCode: day.settlementCode,
      firstReceiptNumber: day.firstReceiptNumber,
      lastReceiptNumber: day.lastReceiptNumber,
      receiptCount: day.receiptCount,
      netTurnover: day.netTurnover,
      outgoingVat: day.outgoingVat,
      vippsFee: day.vippsFee,
      recipientEmail: recipient,
      resendEmailId: sendResult.id,
      status: 'sent',
      errorMessage: null,
      sentAt: new Date(),
    },
    create: {
      settlementDate: date,
      settlementNumber: day.settlementNumber,
      settlementCode: day.settlementCode,
      firstReceiptNumber: day.firstReceiptNumber,
      lastReceiptNumber: day.lastReceiptNumber,
      receiptCount: day.receiptCount,
      netTurnover: day.netTurnover,
      outgoingVat: day.outgoingVat,
      vippsFee: day.vippsFee,
      recipientEmail: recipient,
      resendEmailId: sendResult.id,
      status: 'sent',
      errorMessage: null,
      sentAt: new Date(),
    },
  });

  return {
    date,
    settlementCode: day.settlementCode,
    status: 'sent',
    recipientEmail: recipient,
    resendEmailId: sendResult.id,
  };
}

/**
 * Finds all closed Oslo calendar days (`date < todayOslo` and `date >= AUTO_CRON_START_DATE`)
 * that have not yet been successfully dispatched, and sends one PDF voucher email per day.
 */
export async function dispatchPendingDailySettlementsForCron(): Promise<{
  todayOslo: string;
  startDate: string;
  checkedDays: number;
  results: DispatchSingleResult[];
}> {
  const todayOslo = getTodayOslo();
  const [receiptsAsc, sentDispatches] = await Promise.all([
    getEnrichedAccountingReceipts({ order: 'asc' }),
    prisma.dailySettlementDispatch.findMany({
      where: { status: 'sent' },
      select: { settlementDate: true },
    }),
  ]);

  const sentSet = new Set(sentDispatches.map((d) => d.settlementDate));
  const report = buildDailySettlementReport(receiptsAsc);
  const candidates = report.days.filter(
    (d) =>
      d.date >= AUTO_CRON_START_DATE &&
      d.date < todayOslo &&
      !sentSet.has(d.date)
  );

  const results: DispatchSingleResult[] = [];
  for (const day of candidates) {
    const res = await dispatchDailySettlement({ date: day.date, forceResend: false });
    results.push(res);
  }

  return {
    todayOslo,
    startDate: AUTO_CRON_START_DATE,
    checkedDays: candidates.length,
    results,
  };
}
