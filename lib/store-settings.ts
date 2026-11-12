import { Prisma, StoreSettings } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const DEFAULT_STORE_SETTINGS_ID = 'default';

type PrismaLikeClient = Prisma.TransactionClient | typeof prisma;

function roundOre(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Retrieves the singleton StoreSettings row (`id = 'default'`), creating it
 * with `isVatRegistered: false` and `defaultVatRate: 25` if missing.
 */
export async function getStoreSettings(client: PrismaLikeClient = prisma): Promise<StoreSettings> {
  const existing = await client.storeSettings.findUnique({
    where: { id: DEFAULT_STORE_SETTINGS_ID },
  });

  if (existing) {
    return existing;
  }

  return await client.storeSettings.upsert({
    where: { id: DEFAULT_STORE_SETTINGS_ID },
    update: {},
    create: {
      id: DEFAULT_STORE_SETTINGS_ID,
      isVatRegistered: false,
      defaultVatRate: 25,
    },
  });
}

/**
 * Updates the singleton StoreSettings row. Does not alter historical Receipt records.
 */
export async function updateStoreSettings(params: {
  isVatRegistered?: boolean;
  defaultVatRate?: number;
}): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const nextIsVatRegistered =
    typeof params.isVatRegistered === 'boolean' ? params.isVatRegistered : current.isVatRegistered;
  const nextDefaultVatRate =
    typeof params.defaultVatRate === 'number' && Number.isFinite(params.defaultVatRate)
      ? Math.max(0, Math.min(100, Math.round(params.defaultVatRate)))
      : current.defaultVatRate;

  return await prisma.storeSettings.upsert({
    where: { id: DEFAULT_STORE_SETTINGS_ID },
    update: {
      isVatRegistered: nextIsVatRegistered,
      defaultVatRate: nextDefaultVatRate,
    },
    create: {
      id: DEFAULT_STORE_SETTINGS_ID,
      isVatRegistered: nextIsVatRegistered,
      defaultVatRate: nextDefaultVatRate,
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
