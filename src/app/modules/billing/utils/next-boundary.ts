import type { EntitlementSnapshot } from "../models/api/response/subscription-response.model";

/** setTimeout keeps delays in a signed 32-bit int; anything longer fires immediately. */
const MAX_TIMER_MS = 2 ** 31 - 1;
const MARGIN_MS = 1000;

/**
 * How long until a full-access subscription can turn read-only by the calendar -- the soonest of
 * the trial end, the paid period end and the grace end -- or null when none is coming (already
 * read-only, no future date, or too far off for a timer). Nothing raises an event at that moment,
 * so the UI refetches the entitlements then instead of staying "full" until a save is refused.
 * Mirrors the server's cache cut-off (CachedEntitlementProvider.ExpiryFor).
 */
export function msUntilNextBoundary(
  snapshot: EntitlementSnapshot | undefined,
  nowMs: number,
): number | null {
  if (!snapshot || snapshot.accessMode === "ReadOnly") return null;

  const waits = [
    snapshot.trialEndsAtUtc,
    snapshot.currentPeriodEndUtc,
    snapshot.graceEndsAtUtc,
  ]
    .map((date) => (date ? new Date(date).getTime() - nowMs : NaN))
    .filter((wait) => wait > 0);
  if (waits.length === 0) return null;

  const wait = Math.min(...waits) + MARGIN_MS;
  return wait > MAX_TIMER_MS ? null : wait;
}
