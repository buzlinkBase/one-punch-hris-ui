const PESO_FORMAT = new Intl.NumberFormat("en-PH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Rounds to the centavo. EPSILON keeps values like 1.005 from rounding down to 1.00. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * "1,234.50" -- every peso amount shows exactly 2 decimals. A bare
 * toLocaleString({ minimumFractionDigits: 2 }) still allows 3 (its default maximum), which showed
 * amounts like "1,234.568".
 */
export function formatMoney(value: number | null | undefined): string {
  return PESO_FORMAT.format(value ?? 0);
}
