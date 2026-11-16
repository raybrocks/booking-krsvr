import { Prisma, StoreSettings } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getTodayOslo } from '@/lib/settings';

export const DEFAULT_STORE_SETTINGS_ID = 'default';
export const DEFAULT_VOUCHER_EMAIL = 'krs-vr-arena-as@bilag.fiken.no';
export const DEFAULT_VAT_THRESHOLD_DATE = '2026-09-04';
export const DEFAULT_VAT_RATE = 12;

type PrismaLikeClient = Prisma.TransactionClient | typeof prisma;

function roundOre(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function isValidIsoDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/**
 * VAT is active from and including `vatThresholdPassedDate` (Europe/Oslo calendar date).
 */
export function isVatActiveForDate(
  settings: Pick<StoreSettings, 'vatThresholdPassedDate'>,
  osloDateStr: string = getTodayOslo()
): boolean {
  const thresholdDate = settings.vatThresholdPassedDate?.trim();
  if (!thresholdDate || !isValidIsoDate(thresholdDate)) {
    return false;
  }
  return osloDateStr >= thresholdDate;
}

/**
 * Resolves effective VAT rate (0 or `defaultVatRate`) for the given Europe/Oslo date.
 */
export function resolveEffectiveVatRate(
  settings: Pick<StoreSettings, 'vatThresholdPassedDate' | 'defaultVatRate'>,
  osloDateStr: string = getTodayOslo()
): number {
  return isVatActiveForDate(settings, osloDateStr) ? settings.defaultVatRate : 0;
}

/**
 * Retrieves the singleton StoreSettings row (`id = 'default'`), creating it
 * with defaults if missing and keeping `isVatRegistered` derived from `vatThresholdPassedDate`.
 */
export async function getStoreSettings(client: PrismaLikeClient = prisma): Promise<StoreSettings> {
  const existing = await client.storeSettings.findUnique({
    where: { id: DEFAULT_STORE_SETTINGS_ID },
  });

  if (existing) {
    return {
      ...existing,
      isVatRegistered: isVatActiveForDate(existing),
    };
  }

  const initialRegistered = isVatActiveForDate({
    vatThresholdPassedDate: DEFAULT_VAT_THRESHOLD_DATE,
  });

  return await client.storeSettings.upsert({
    where: { id: DEFAULT_STORE_SETTINGS_ID },
    update: {},
    create: {
      id: DEFAULT_STORE_SETTINGS_ID,
      isVatRegistered: initialRegistered,
      defaultVatRate: DEFAULT_VAT_RATE,
      vatThresholdPassedDate: DEFAULT_VAT_THRESHOLD_DATE,
      voucherEmail: DEFAULT_VOUCHER_EMAIL,
    },
  });
}

/**
 * Updates the singleton StoreSettings row. Does not alter historical Receipt records.
 */
export async function updateStoreSettings(params: {
  defaultVatRate?: number;
  vatThresholdPassedDate?: string | null;
  voucherEmail?: string | null;
}): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const nextDefaultVatRate =
    typeof params.defaultVatRate === 'number' && Number.isFinite(params.defaultVatRate)
      ? Math.max(0, Math.min(100, Math.round(params.defaultVatRate)))
      : current.defaultVatRate;
  const nextThresholdDate =
    params.vatThresholdPassedDate !== undefined
      ? (params.vatThresholdPassedDate ? params.vatThresholdPassedDate.trim() : null)
      : current.vatThresholdPassedDate;
  const nextIsVatRegistered = isVatActiveForDate({
    vatThresholdPassedDate: nextThresholdDate,
  });
  const nextVoucherEmail =
    params.voucherEmail !== undefined
      ? (params.voucherEmail ? params.voucherEmail.trim() : null)
      : current.voucherEmail;

  return await prisma.storeSettings.upsert({
    where: { id: DEFAULT_STORE_SETTINGS_ID },
    update: {
      isVatRegistered: nextIsVatRegistered,
      defaultVatRate: nextDefaultVatRate,
      vatThresholdPassedDate: nextThresholdDate,
      voucherEmail: nextVoucherEmail,
    },
    create: {
      id: DEFAULT_STORE_SETTINGS_ID,
      isVatRegistered: nextIsVatRegistered,
      defaultVatRate: nextDefaultVatRate,
      vatThresholdPassedDate: nextThresholdDate,
      voucherEmail: nextVoucherEmail,
    },
  });
}

export interface ReceiptVatBreakdown {
  vatRate: number;
  vatAmount: number;
  netAmount: number;
}

/**
 * Calculates immutable VAT breakdown from a customer-paid total amount (inclusive of VAT).
 * Supports both positive sales and negative refund/credit notes symmetrically so
 * `netAmount + vatAmount === roundOre(amountNok)` always holds.
 */
export function computeReceiptVat(
  amountNok: number,
  vatRatePercent: number
): ReceiptVatBreakdown {
  const roundedTotal = roundOre(amountNok);
  const normalizedRate =
    Number.isFinite(vatRatePercent) && vatRatePercent > 0 ? Math.round(vatRatePercent) : 0;

  if (normalizedRate <= 0 || roundedTotal === 0) {
    return {
      vatRate: 0,
      vatAmount: 0,
      netAmount: roundedTotal,
    };
  }

  const absTotal = Math.abs(roundedTotal);
  const absExVatExact = absTotal / (1 + normalizedRate / 100);
  const absVat = roundOre(absTotal - absExVatExact);
  const absNet = roundOre(absTotal - absVat);
  const sign = roundedTotal < 0 ? -1 : 1;

  return {
    vatRate: normalizedRate,
    vatAmount: sign < 0 && absVat !== 0 ? -absVat : absVat,
    netAmount: sign < 0 && absNet !== 0 ? -absNet : absNet,
  };
}
