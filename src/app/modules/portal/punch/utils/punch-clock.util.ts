import dayjs, { type Dayjs } from "dayjs";

/**
 * The server sends Manila wall-clock times with no timezone. Reading them as plain local
 * date-times (dropping any "Z") keeps the displayed hour the same on any device.
 */
export function parseWallClock(value: string): Dayjs {
  return dayjs(value.replace(/Z$/, ""));
}

/**
 * Seconds left before the next punch is allowed. `nextAllowedAt` and `serverNow` come from the
 * same response, so the device's own clock (and timezone) never decides; `elapsedMs` is how long
 * ago the response arrived.
 */
export function secondsUntilNextPunch(
  nextAllowedAt: string | null,
  serverNow: string,
  elapsedMs: number,
): number {
  if (!nextAllowedAt) return 0;
  const waitMs =
    parseWallClock(nextAllowedAt).diff(parseWallClock(serverNow)) - elapsedMs;
  return Math.max(0, Math.ceil(waitMs / 1000));
}

/** "4:05" for 245 seconds. */
export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
