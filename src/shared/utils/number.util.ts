/**
 * The DTR-wide display rule for hours and minutes: always 2 decimals, so minute-level time
 * stays visible and columns line up, e.g. 62 min of OT (1.0333 h) -> "1.03", 8 -> "8.00".
 * Counts (days, absences, occurrences) are whole numbers and don't go through this.
 */
export function formatDecimal(value: number, digits = 2): string {
  return value.toFixed(digits);
}
