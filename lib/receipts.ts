import { prisma } from '@/lib/prisma';

export interface EnrichedReceiptRecord {
  id: string;
  receiptId: string;
  receiptNumber: number;
  receiptCode: string;
  bookingId: string | null;
  giftCardId: string | null;
  orderType: string;
  amount: number;
  vatRate: number;
  vatAmount: number;
  netAmount: number;
  currency: string;
  status: string;
  type: string;
  paymentRef: string;
  createdAt: Date;
  booking: any | null;
  giftCard: any | null;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  experienceId: string;
  experienceName: string;
  totalPrice: number;
  amountPaid: number;
  paymentType: 'vipps';
  date: string;
  time: string;
  discountCode: string | null;
  giftCardCode: string | null;
  giftCardAmount: number;
}

export interface DailyReceiptEntry {
  sequenceNo: number;
  receiptNumberInt: number;
  receiptNumber: string;
  settlementNumber: number;
  settlementCode: string;
  id: string;
  osloDate: string;
  osloTime: string;
  createdAt: string;
  amount: number;
  netAmount: number;
  vatRatePercent: number;
  vatAmount: number;
  vippsFee: number;
  status: string;
  type: string;
  orderType: string;
  paymentRef: string;
  bookingId: string | null;
  giftCardId: string | null;
  customerName: string;
  companyName: string;
  experienceName: string;
  discountCode: string | null;
  runningGrossSales: number;
  runningNetTurnover: number;
}

export interface DailySettlementDay {
  settlementNumber: number;
  settlementCode: string;
  date: string;
  firstSequenceNo: number;
  lastSequenceNo: number;
  firstReceiptNumber: string;
  lastReceiptNumber: string;
  firstReceiptId: string;
  lastReceiptId: string;
  receiptCount: number;
  paymentCount: number;
  refundCount: number;
  grossSales: number;
  refunds: number;
  netTurnover: number;
  revenue0Vat: number;
  revenue12VatBasis: number;
  revenue25VatBasis: number;
  revenueOtherVatBasis: number;
  outgoingVat: number;
  vippsFee: number;
  estimatedVippsPayout: number;
  accumulatedGrossSales: number;
  accumulatedTurnover: number;
  receipts: DailyReceiptEntry[];
}

export interface DailySettlementReport {
  generatedAt: string;
  timezone: 'Europe/Oslo';
  schemaNote: string;
  summary: {
    totalDays: number;
    totalReceipts: number;
    totalPayments: number;
    totalRefunds: number;
    totalGrossSales: number;
    totalRefundsAmount: number;
    totalNetTurnover: number;
    totalRevenue0Vat: number;
    totalRevenue12VatBasis: number;
    totalRevenue25VatBasis: number;
    totalRevenueOtherVatBasis: number;
    totalOutgoingVat: number;
    totalVippsFee: number;
    totalEstimatedVippsPayout: number;
    firstDate: string | null;
    lastDate: string | null;
  };
  days: DailySettlementDay[];
}

export const VIPPS_FEE_PERCENT = 0.0299;
export const VIPPS_FEE_FIXED_NOK = 1;
export const VIPPS_FEE_ACCOUNT_NOTE =
  'Bank og kortgebyrer føres mot KTO 7770 Bank- og kortgebyrer.';

/**
 * Exact Vipps settlement fee overrides for the first 5 historical "Vipps Handlekurv"
 * transactions (KV-1001..KV-1005, 1.75% fee rate) from the official Vipps settlement report.
 */
const VIPPS_HANDLEKURV_FEE_BY_REF: Record<string, number> = {
  '13022956342': 4.38, // KV-1001 · 2026-03-07 19:18:31 · 250,00 kr -> netto 245,62 kr
  '13022958017': 4.38, // KV-1002 · 2026-03-07 19:18:48 · 250,00 kr -> netto 245,62 kr
  '13022960912': 4.38, // KV-1003 · 2026-03-07 19:19:14 · 250,00 kr -> netto 245,62 kr
  '13022961941': 4.38, // KV-1004 · 2026-03-07 19:19:36 · 250,00 kr -> netto 245,62 kr
  '13241689256': 13.13, // KV-1005 · 2026-04-11 15:51:30 · 750,00 kr -> netto 736,87 kr
};

const VIPPS_HANDLEKURV_FEE_BY_RECEIPT_NO: Record<number, number> = {
  1001: 4.38,
  1002: 4.38,
  1003: 4.38,
  1004: 4.38,
  1005: 13.13,
};

function roundOre(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates Vipps transaction fee per captured payment receipt:
 * - First 5 historical "Vipps Handlekurv" receipts (KV-1001..KV-1005) use exact settlement report fees (1.75%).
 * - Subsequent Vipps ePayment receipts use 2.99% + 1 NOK.
 * - Refunds carry 0 NOK additional fee (Vipps retains the original sale fee).
 */
export function computeVippsFee(
  amountNok: number,
  status: string,
  type: string,
  paymentRef?: string | null,
  receiptNumberInt?: number | null
): number {
  if (status === 'CAPTURED' && type === 'payment' && amountNok > 0) {
    const cleanRef = (paymentRef || '').trim();
    if (cleanRef && VIPPS_HANDLEKURV_FEE_BY_REF[cleanRef] !== undefined) {
      return VIPPS_HANDLEKURV_FEE_BY_REF[cleanRef];
    }
    if (
      typeof receiptNumberInt === 'number' &&
      VIPPS_HANDLEKURV_FEE_BY_RECEIPT_NO[receiptNumberInt] !== undefined
    ) {
      return VIPPS_HANDLEKURV_FEE_BY_RECEIPT_NO[receiptNumberInt];
    }
    return roundOre(amountNok * VIPPS_FEE_PERCENT + VIPPS_FEE_FIXED_NOK);
  }
  return 0;
}

/**
 * Formats a Date into exact Europe/Oslo YYYY-MM-DD and HH:mm:ss parts.
 */
export function formatOsloDateTime(dateInput: Date | string): { osloDate: string; osloTime: string } {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || '00';

  const osloDate = `${get('year')}-${get('month')}-${get('day')}`;
  const osloTime = `${get('hour')}:${get('minute')}:${get('second')}`;
  return { osloDate, osloTime };
}

/**
 * Formats the unbroken sequential receipt number as KV-xxxx (e.g. KV-1001).
 */
export function formatReceiptNumber(receiptNumber: number): string {
  return `KV-${receiptNumber}`;
}

/**
 * Formats the unbroken sequential daily settlement number as DO-xxx (e.g. DO-101).
 */
export function formatDailySettlementCode(settlementNumber: number): string {
  return `DO-${settlementNumber}`;
}

/**
 * Fetches verified accounting receipts (`CAPTURED` and `REFUNDED`, non-zero, non-terminal)
 * read-only from PostgreSQL via Prisma and enriches them with booking/gift-card metadata.
 */
export async function getEnrichedAccountingReceipts(options?: {
  order?: 'asc' | 'desc';
  limit?: number;
}): Promise<EnrichedReceiptRecord[]> {
  const order = options?.order ?? 'desc';
  const limit = options?.limit;

  const [receipts, bookings, giftCards] = await Promise.all([
    prisma.receipt.findMany({
      where: {
        status: { in: ['CAPTURED', 'REFUNDED'] },
        type: { in: ['payment', 'refund'] },
        NOT: { paymentRef: { startsWith: 'terminal-' } },
        amount: { not: 0 },
      },
      orderBy: [{ receiptNumber: order }, { createdAt: order }, { id: order }],
      take: limit,
    }),
    prisma.booking.findMany({
      include: { experience: true },
    }),
    prisma.giftCard.findMany(),
  ]);

  const bookingMap = new Map<string, any>();
  bookings.forEach((b) => {
    bookingMap.set(b.id, b);
    if (b.paymentRef) {
      bookingMap.set(b.paymentRef, b);
    }
  });

  const giftCardMap = new Map<string, any>();
  giftCards.forEach((gc) => {
    giftCardMap.set(gc.id, gc);
    if (gc.paymentRef) {
      giftCardMap.set(gc.paymentRef, gc);
    }
  });

  return receipts.map((r) => {
    const b = r.bookingId
      ? bookingMap.get(r.bookingId) || (r.paymentRef ? bookingMap.get(r.paymentRef) : null)
      : null;
    const gc = r.giftCardId
      ? giftCardMap.get(r.giftCardId) || (r.paymentRef ? giftCardMap.get(r.paymentRef) : null)
      : null;

    const isGiftCard = Boolean(r.orderType === 'gift_card' || r.giftCardId || gc);
    const vatRate = typeof r.vatRate === 'number' ? r.vatRate : 0;
    const vatAmount = typeof r.vatAmount === 'number' ? roundOre(r.vatAmount) : 0;
    const netAmount =
      typeof r.netAmount === 'number' ? roundOre(r.netAmount) : roundOre(r.amount - vatAmount);

    return {
      id: r.id,
      receiptId: r.id,
      receiptNumber: r.receiptNumber,
      receiptCode: formatReceiptNumber(r.receiptNumber),
      bookingId: r.bookingId,
      giftCardId: r.giftCardId,
      orderType: r.orderType || (isGiftCard ? 'gift_card' : 'booking'),
      amount: r.amount,
      vatRate,
      vatAmount,
      netAmount,
      currency: r.currency || 'NOK',
      status: r.status,
      type: r.type || (r.amount < 0 ? 'refund' : 'payment'),
      paymentRef: r.paymentRef,
      createdAt: r.createdAt,
      booking: b || null,
      giftCard: gc || null,
      firstName: isGiftCard ? gc?.buyerName || 'Gavekortkunde' : b?.firstName || 'Kunde',
      lastName: isGiftCard ? '' : b?.lastName || '',
      companyName: b?.companyName || '',
      email: isGiftCard ? gc?.buyerEmail || '' : b?.email || '',
      phone: isGiftCard ? gc?.buyerPhone || '' : b?.phone || '',
      experienceId: isGiftCard ? 'gift_card' : b?.experienceId || '',
      experienceName: isGiftCard
        ? `Gavekort ${gc?.targetPersons ? `(${gc.targetPersons} pers)` : ''} · Kode: ${gc?.code || ''}`
        : b?.experience?.name || 'VR Opplevelse',
      totalPrice: isGiftCard ? gc?.initialAmount || Math.abs(r.amount) : b?.totalPrice || Math.abs(r.amount),
      amountPaid: isGiftCard ? Math.abs(r.amount) : b?.amountPaid || 0,
      paymentType: 'vipps',
      date: isGiftCard ? (gc?.createdAt ? new Date(gc.createdAt).toISOString().split('T')[0] : '') : b?.date || '',
      time: isGiftCard ? 'Nettbutikk' : b?.time || '',
      discountCode: isGiftCard ? null : b?.discountCode || null,
      giftCardCode: isGiftCard ? gc?.code || null : b?.giftCardCode || null,
      giftCardAmount: isGiftCard ? 0 : Number(b?.giftCardAmount || 0),
    };
  });
}

/**
 * Groups chronologically sorted accounting receipts into Europe/Oslo daily settlements
 * with running gross and net totals plus unbroken sequence numbers.
 */
export function buildDailySettlementReport(receiptsAsc: EnrichedReceiptRecord[]): DailySettlementReport {
  const sorted = [...receiptsAsc].sort((a, b) => {
    if (a.receiptNumber !== b.receiptNumber) {
      return a.receiptNumber - b.receiptNumber;
    }
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });

  const dayMap = new Map<string, DailySettlementDay>();
  let runningGross = 0;
  let runningNet = 0;
  let totalPayments = 0;
  let totalRefunds = 0;
  let totalRefundsAmount = 0;
  let totalRevenue0Vat = 0;
  let totalRevenue12VatBasis = 0;
  let totalRevenue25VatBasis = 0;
  let totalRevenueOtherVatBasis = 0;
  let totalOutgoingVat = 0;
  let totalVippsFee = 0;

  sorted.forEach((r) => {
    const receiptNumInt = r.receiptNumber;
    const receiptNumber = formatReceiptNumber(receiptNumInt);
    const { osloDate, osloTime } = formatOsloDateTime(r.createdAt);

    const vatRatePercent = typeof r.vatRate === 'number' ? r.vatRate : 0;
    const vatAmount = roundOre(typeof r.vatAmount === 'number' ? r.vatAmount : 0);
    const netAmount =
      typeof r.netAmount === 'number' ? roundOre(r.netAmount) : roundOre(r.amount - vatAmount);
    const vippsFee = computeVippsFee(
      roundOre(r.amount),
      r.status,
      r.type,
      r.paymentRef,
      receiptNumInt
    );

    const rev0 = vatRatePercent === 0 ? netAmount : 0;
    const rev12 = vatRatePercent === 12 ? netAmount : 0;
    const rev25 = vatRatePercent === 25 ? netAmount : 0;
    const revOther = vatRatePercent > 0 && vatRatePercent !== 12 && vatRatePercent !== 25 ? netAmount : 0;

    if (r.amount > 0) {
      runningGross = roundOre(runningGross + r.amount);
      totalPayments += 1;
    } else {
      totalRefunds += 1;
      totalRefundsAmount = roundOre(totalRefundsAmount + r.amount);
    }
    runningNet = roundOre(runningNet + r.amount);
    totalRevenue0Vat = roundOre(totalRevenue0Vat + rev0);
    totalRevenue12VatBasis = roundOre(totalRevenue12VatBasis + rev12);
    totalRevenue25VatBasis = roundOre(totalRevenue25VatBasis + rev25);
    totalRevenueOtherVatBasis = roundOre(totalRevenueOtherVatBasis + revOther);
    totalOutgoingVat = roundOre(totalOutgoingVat + vatAmount);
    totalVippsFee = roundOre(totalVippsFee + vippsFee);

    const customerName = [r.firstName, r.lastName].filter(Boolean).join(' ').trim() || 'Kunde';

    const entry: DailyReceiptEntry = {
      sequenceNo: receiptNumInt,
      receiptNumberInt: receiptNumInt,
      receiptNumber,
      settlementNumber: 0,
      settlementCode: '',
      id: r.id,
      osloDate,
      osloTime,
      createdAt: new Date(r.createdAt).toISOString(),
      amount: roundOre(r.amount),
      netAmount,
      vatRatePercent,
      vatAmount,
      vippsFee,
      status: r.status,
      type: r.type,
      orderType: r.orderType,
      paymentRef: r.paymentRef,
      bookingId: r.bookingId,
      giftCardId: r.giftCardId,
      customerName,
      companyName: r.companyName || '',
      experienceName: r.experienceName || 'VR Opplevelse',
      discountCode: r.discountCode || null,
      runningGrossSales: runningGross,
      runningNetTurnover: runningNet,
    };

    const existing = dayMap.get(osloDate);
    if (!existing) {
      dayMap.set(osloDate, {
        settlementNumber: 0,
        settlementCode: '',
        date: osloDate,
        firstSequenceNo: receiptNumInt,
        lastSequenceNo: receiptNumInt,
        firstReceiptNumber: receiptNumber,
        lastReceiptNumber: receiptNumber,
        firstReceiptId: r.id,
        lastReceiptId: r.id,
        receiptCount: 1,
        paymentCount: r.amount > 0 ? 1 : 0,
        refundCount: r.amount < 0 ? 1 : 0,
        grossSales: r.amount > 0 ? roundOre(r.amount) : 0,
        refunds: r.amount < 0 ? roundOre(r.amount) : 0,
        netTurnover: roundOre(r.amount),
        revenue0Vat: rev0,
        revenue12VatBasis: rev12,
        revenue25VatBasis: rev25,
        revenueOtherVatBasis: revOther,
        outgoingVat: vatAmount,
        vippsFee,
        estimatedVippsPayout: roundOre(r.amount - vippsFee),
        accumulatedGrossSales: runningGross,
        accumulatedTurnover: runningNet,
        receipts: [entry],
      });
    } else {
      existing.lastSequenceNo = receiptNumInt;
      existing.lastReceiptNumber = receiptNumber;
      existing.lastReceiptId = r.id;
      existing.receiptCount += 1;
      if (r.amount > 0) {
        existing.paymentCount += 1;
        existing.grossSales = roundOre(existing.grossSales + r.amount);
      } else {
        existing.refundCount += 1;
        existing.refunds = roundOre(existing.refunds + r.amount);
      }
      existing.netTurnover = roundOre(existing.netTurnover + r.amount);
      existing.revenue0Vat = roundOre(existing.revenue0Vat + rev0);
      existing.revenue12VatBasis = roundOre(existing.revenue12VatBasis + rev12);
      existing.revenue25VatBasis = roundOre(existing.revenue25VatBasis + rev25);
      existing.revenueOtherVatBasis = roundOre(existing.revenueOtherVatBasis + revOther);
      existing.outgoingVat = roundOre(existing.outgoingVat + vatAmount);
      existing.vippsFee = roundOre(existing.vippsFee + vippsFee);
      existing.estimatedVippsPayout = roundOre(existing.netTurnover - existing.vippsFee);
      existing.accumulatedGrossSales = runningGross;
      existing.accumulatedTurnover = runningNet;
      existing.receipts.push(entry);
    }
  });

  // Kun dager med faktisk omsetnings-/bilagsaktivitet inkluderes og nummereres DO-101, DO-102, ...
  const days = Array.from(dayMap.values())
    .filter((d) => d.receiptCount > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day, idx) => {
      const settlementNumber = 101 + idx;
      const settlementCode = formatDailySettlementCode(settlementNumber);
      day.settlementNumber = settlementNumber;
      day.settlementCode = settlementCode;
      day.receipts.forEach((entry) => {
        entry.settlementNumber = settlementNumber;
        entry.settlementCode = settlementCode;
      });
      return day;
    });

  return {
    generatedAt: new Date().toISOString(),
    timezone: 'Europe/Oslo',
    schemaNote:
      'Ubrutt fortløpende nummerserie fra PostgreSQL: kvitteringer nummereres KV-xxxx (start 1001) og dager med omsetningsaktivitet nummereres DO-xxx (start 101) kronologisk etter Europe/Oslo.',
    summary: {
      totalDays: days.length,
      totalReceipts: sorted.length,
      totalPayments,
      totalRefunds,
      totalGrossSales: runningGross,
      totalRefundsAmount,
      totalNetTurnover: runningNet,
      totalRevenue0Vat,
      totalRevenue12VatBasis,
      totalRevenue25VatBasis,
      totalRevenueOtherVatBasis,
      totalOutgoingVat,
      totalVippsFee,
      totalEstimatedVippsPayout: roundOre(runningNet - totalVippsFee),
      firstDate: days.length > 0 ? days[0].date : null,
      lastDate: days.length > 0 ? days[days.length - 1].date : null,
    },
    days,
  };
}

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? String(value)
      : value.toFixed(2).replace('.', ',');
  }
  const str = String(value);
  const isNumericString = /^-?\d+(?:[.,]\d+)?$/.test(str);
  const safe = !isNumericString && /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  if (/[;"\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

function formatNokCsv(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

/**
 * Generates a semicolon-delimited UTF-8 BOM CSV of daily Vipps settlements for Norwegian Excel/Sheets and Fiken bookkeeping.
 */
export function generateDailySettlementCsv(report: DailySettlementReport): string {
  const header = [
    'Dagsoppgjørsnr.',
    'Dato',
    'Fra kvitteringsnr.',
    'Til kvitteringsnr.',
    'Antall salg',
    'Antall refusjoner',
    'Antall bilag totalt',
    'Dagens brutto salg inkl. MVA (NOK)',
    'Dagens refusjoner inkl. MVA (NOK)',
    'Dagens sum netto inkl. MVA (NOK)',
    'Omsetning 0 % MVA (NOK)',
    'Omsetning 12 % MVA (grunnlag) (NOK)',
    'Omsetning 25 % MVA (grunnlag) (NOK)',
    'Omsetning annen MVA (grunnlag) (NOK)',
    'Utgående MVA (NOK)',
    'Vipps-gebyr KTO 7770 (NOK)',
    'Estimert nettoutbetaling Vipps (NOK)',
    'Akkumulert brutto Vipps (NOK)',
    'Akkumulert sum netto (NOK)',
  ]
    .map(escapeCsvCell)
    .join(';');

  const rows = report.days.map((d) =>
    [
      d.settlementCode,
      d.date,
      d.firstReceiptNumber,
      d.lastReceiptNumber,
      d.paymentCount,
      d.refundCount,
      d.receiptCount,
      formatNokCsv(d.grossSales),
      formatNokCsv(d.refunds),
      formatNokCsv(d.netTurnover),
      formatNokCsv(d.revenue0Vat),
      formatNokCsv(d.revenue12VatBasis),
      formatNokCsv(d.revenue25VatBasis),
      formatNokCsv(d.revenueOtherVatBasis),
      formatNokCsv(d.outgoingVat),
      formatNokCsv(d.vippsFee),
      formatNokCsv(d.estimatedVippsPayout),
      formatNokCsv(d.accumulatedGrossSales),
      formatNokCsv(d.accumulatedTurnover),
    ]
      .map(escapeCsvCell)
      .join(';')
  );

  return '\uFEFF' + [header, ...rows].join('\r\n') + '\r\n';
}

/**
 * Generates a semicolon-delimited UTF-8 BOM CSV of individual receipts (all days or one date).
 */
export function generateReceiptDetailsCsv(
  report: DailySettlementReport,
  dateFilter?: string | null
): string {
  const header = [
    'Dagsoppgjørsnr.',
    'Dato',
    'Klokkeslett (Europe/Oslo)',
    'Kvitteringsnummer',
    'Løpenummer',
    'System-ID',
    'Status',
    'Type',
    'Ordretype',
    'Vipps Ref',
    'Booking/Gavekort ID',
    'Kunde',
    'Opplevelse',
    'Beløp inkl. MVA (NOK)',
    'Grunnlag eks. MVA (NOK)',
    'MVA-sats (%)',
    'Utgående MVA (NOK)',
    'Vipps-gebyr KTO 7770 (NOK)',
    'Akkumulert brutto Vipps (NOK)',
    'Akkumulert netto Vipps (NOK)',
  ]
    .map(escapeCsvCell)
    .join(';');

  const targetDays = dateFilter
    ? report.days.filter((d) => d.date === dateFilter)
    : report.days;

  const rows = targetDays.flatMap((d) =>
    d.receipts.map((r) =>
      [
        r.settlementCode,
        r.osloDate,
        r.osloTime,
        r.receiptNumber,
        r.receiptNumberInt,
        r.id,
        r.status,
        r.type,
        r.orderType,
        r.paymentRef,
        r.bookingId || r.giftCardId || '',
        r.companyName ? `${r.customerName} (${r.companyName})` : r.customerName,
        r.experienceName,
        formatNokCsv(r.amount),
        formatNokCsv(r.netAmount),
        r.vatRatePercent,
        formatNokCsv(r.vatAmount),
        formatNokCsv(r.vippsFee),
        formatNokCsv(r.runningGrossSales),
        formatNokCsv(r.runningNetTurnover),
      ]
        .map(escapeCsvCell)
        .join(';')
    )
  );

  return '\uFEFF' + [header, ...rows].join('\r\n') + '\r\n';
}
