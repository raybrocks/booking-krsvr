export const DEFAULT_PRICING_TIERS: Record<string, number> = {
  "1": 460,
  "2": 460,
  "3": 395,
  "4": 395,
  "5": 385,
  "6": 385,
  "7": 385,
  "8": 375,
};

/**
 * Returns the unit price per person for a given group size based on tiers.
 */
export function getPricePerPerson(players: number, customTiers?: Record<string, number> | null): number {
  const tiers = customTiers && Object.keys(customTiers).length > 0 ? customTiers : DEFAULT_PRICING_TIERS;
  const count = Math.max(1, Math.floor(players || 1));
  
  if (count === 1) return Number(tiers["1"] ?? tiers["2"] ?? 460);
  if (count === 2) return Number(tiers["2"] ?? 460);
  if (count === 3 || count === 4) return Number(tiers["3"] ?? tiers["4"] ?? 395);
  if (count >= 5 && count <= 7) return Number(tiers["5"] ?? tiers["6"] ?? tiers["7"] ?? 385);
  return Number(tiers["8"] ?? 375);
}

/**
 * Returns the standard total price for a given number of persons.
 */
export function calculateTotalPriceForPersons(players: number, customTiers?: Record<string, number> | null): number {
  const count = Math.max(1, Math.floor(players || 1));
  const unitPrice = getPricePerPerson(count, customTiers);
  return unitPrice * count;
}

export interface GiftCardPreset {
  persons: number;
  pricePerPerson: number;
  totalPrice: number;
  isPopular?: boolean;
  label: string;
}

export const GIFT_CARD_PRESETS: GiftCardPreset[] = [
  { persons: 2, pricePerPerson: 460, totalPrice: 920, isPopular: false, label: "2 personer" },
  { persons: 3, pricePerPerson: 395, totalPrice: 1185, isPopular: false, label: "3 personer" },
  { persons: 4, pricePerPerson: 395, totalPrice: 1580, isPopular: true, label: "4 personer" },
  { persons: 5, pricePerPerson: 385, totalPrice: 1925, isPopular: false, label: "5 personer" },
  { persons: 6, pricePerPerson: 385, totalPrice: 2310, isPopular: true, label: "6 personer" },
  { persons: 8, pricePerPerson: 375, totalPrice: 3000, isPopular: false, label: "8 personer" },
];
