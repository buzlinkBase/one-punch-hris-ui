import dayjs from "dayjs";

/** "13:05:09" for an ISO date-time; empty string when missing or invalid. */
export function formatClock(value?: string | null): string {
  if (!value) return "";
  const d = dayjs(value);
  return d.isValid() ? d.format("HH:mm:ss") : "";
}

/** "2026-01-05 13:05:09" for an ISO date-time; empty string when missing or invalid. */
export function formatClockDateTime(value?: string | null): string {
  if (!value) return "";
  const d = dayjs(value);
  return d.isValid() ? d.format("YYYY-MM-DD HH:mm:ss") : "";
}
