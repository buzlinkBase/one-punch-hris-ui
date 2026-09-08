/** Formats a minutes-based value (as stored/sent to the API) for hours display, e.g. 90 -> "1.5". */
export function formatMinutesAsHours(minutes: number): string {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(2);
}
