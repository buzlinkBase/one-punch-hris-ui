import dayjs, { type Dayjs } from "dayjs";

/** Extract the day-offset prefix from a .NET TimeSpan string (e.g. "1.06:00:00" → 1). */
export function getDayOffset(value: string | null | undefined): number {
  if (!value) return 0;
  const dot = value.indexOf(".");
  if (dot > 0 && dot < value.lastIndexOf(":")) {
    const n = parseInt(value.slice(0, dot), 10);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

/** Strip the day-offset prefix, returning only the "HH:mm:ss" portion. */
export function getTimePart(value: string | null | undefined): string {
  if (!value) return "00:00:00";
  const dot = value.indexOf(".");
  if (dot > 0 && dot < value.lastIndexOf(":")) {
    return value.slice(dot + 1);
  }
  return value;
}

/** Parse a .NET TimeSpan string ("d.HH:mm:ss" or "HH:mm:ss" or "HH:mm") into dayjs for TimePicker. */
export function fromTimeSpan(value: string | null | undefined): Dayjs | null {
  if (!value) return null;
  const d = dayjs(`1970-01-01T${getTimePart(value)}`);
  return d.isValid() ? d : null;
}

/** Serialize a dayjs TimePicker value to .NET TimeSpan string "HH:mm:ss". Returns "00:00:00" when null. */
export function toTimeSpan(value: Dayjs | null | undefined): string {
  if (!value?.isValid()) return "00:00:00";
  return value.format("HH:mm:ss");
}

/** Serialize a dayjs value to nullable TimeSpan string. Returns null when empty. */
export function toOptionalTimeSpan(
  value: Dayjs | null | undefined,
): string | null {
  if (!value?.isValid()) return null;
  return value.format("HH:mm:ss");
}

/** Convert a .NET TimeSpan string to total seconds (for comparison). */
export function timeSpanToSeconds(value: string | null | undefined): number {
  if (!value) return 0;
  const dayOffset = getDayOffset(value);
  const timePart = getTimePart(value);
  const [h, m, s] = timePart.split(":").map(Number);
  return dayOffset * 86400 + (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

/**
 * Serialize dayjs + day offset to a .NET TimeSpan string.
 * dayOffset 0 → "HH:mm:ss", dayOffset 1 → "1.HH:mm:ss"
 */
export function toTimeSpanWithDay(
  value: Dayjs | null | undefined,
  dayOffset: number,
): string {
  const time = toTimeSpan(value);
  return dayOffset > 0 ? `${dayOffset}.${time}` : time;
}
