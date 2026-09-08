import dayjs from "dayjs";

/** True when a time-range's end clock-time is earlier than its start — i.e. it crosses
 * midnight into the next day (e.g. 22:00 -> 06:00). */
export function isCrossMidnight(start: string, end: string): boolean {
  return !!start && !!end && end < start;
}

/** Combines a date + time-of-day into an ISO-local datetime string. */
export function buildStartDateTime(date: string, time: string): string {
  if (!date || !time) return "";
  return dayjs(`${date}T${time}`).format("YYYY-MM-DDTHH:mm:ss");
}

/** Combines an end date + time-of-day, rolling forward a day when the end clock-time is
 * earlier than the start clock-time (cross-midnight). */
export function buildEndDateTime(
  endDate: string,
  startTime: string,
  endTime: string,
): string {
  if (!endDate || !endTime) return "";
  const end = dayjs(`${endDate}T${endTime}`);
  const adjusted = endTime < startTime ? end.add(1, "day") : end;
  return adjusted.format("YYYY-MM-DDTHH:mm:ss");
}
