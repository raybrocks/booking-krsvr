/**
 * Central currency helper for international visitors (EN, DE, NL).
 * Official checkout and payment in the arena are always in NOK,
 * while an approximate EUR value helps international tourists immediately understand pricing.
 */

export const EUR_EXCHANGE_RATE = 11.75;

export function toApproxEur(nokAmount: number): number {
  return Math.round(nokAmount / EUR_EXCHANGE_RATE);
}

export function formatNokWithEur(
  nokAmount: number,
  locale: "no" | "en" | "de" | "nl" = "en"
): string {
  if (locale === "no") {
    return `${nokAmount} kr`;
  }
  const eur = toApproxEur(nokAmount);
  if (locale === "de") {
    return `${nokAmount} NOK (ca. €${eur})`;
  }
  if (locale === "nl") {
    return `${nokAmount} NOK (ca. €${eur})`;
  }
  return `${nokAmount} NOK (approx. €${eur})`;
}
