/** One punch recorded today. `at` is Manila wall-clock, with no timezone. */
export interface PortalPunchEntryResponse {
  at: string;
  source: string | number;
}

/** What the Punch In/Out page shows. Times are Manila wall-clock, with no timezone. */
export interface PortalPunchStatusResponse {
  now: string;
  cooldownMinutes: number;
  lastPunchAt: string | null;
  /** Null when the employee can punch right now. */
  nextAllowedAt: string | null;
  today: PortalPunchEntryResponse[];
}

/**
 * The status plus when it arrived on a monotonic timer (`performance.now()`), so the page's clock
 * and countdown keep counting from the server's time even if the device clock is changed.
 */
export type PortalPunchStatus = PortalPunchStatusResponse & {
  receivedAt: number;
};
