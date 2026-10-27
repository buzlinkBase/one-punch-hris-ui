import dayjs from "dayjs";

/**
 * The day's shift as a time-entry guide: "Dayshift · 08:00 – 17:00", with dates when the
 * shift runs past midnight ("Nightshift · Oct 7 22:00 – Oct 8 06:00").
 */
export function describeShift(
  name: string | null | undefined,
  start: string | null | undefined,
  end: string | null | undefined,
): string | null {
  if (!start || !end) return name || null;
  const s = dayjs(start);
  const e = dayjs(end);
  const range = s.isSame(e, "day")
    ? `${s.format("HH:mm:ss")} – ${e.format("HH:mm:ss")}`
    : `${s.format("MMM D HH:mm:ss")} – ${e.format("MMM D HH:mm:ss")}`;
  return name ? `${name} · ${range}` : range;
}
