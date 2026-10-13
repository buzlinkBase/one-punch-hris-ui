import type { EntitlementSnapshot } from "../models/api/response/subscription-response.model";

const DAY_MS = 24 * 60 * 60 * 1000;

export type SubscriptionBannerKind =
  | "trial-welcome"
  | "trial-days-left"
  | "trial-ends-tomorrow"
  | "trial-ends-today"
  | "canceling"
  | "past-due"
  | "read-only";

export interface SubscriptionBannerState {
  kind: SubscriptionBannerKind;
  /** Can be closed (until the next day it's due). */
  dismissible: boolean;
  /** Also open the plan selection popup -- at most once a day. */
  showPlanPopup: boolean;
  /** Whole days left after today, for trial banners. */
  daysLeft?: number;
  /** The date the banner is about (trial end, period end, grace end), UTC ISO. */
  date?: string | null;
  /**
   * Read-only because a paid plan lapsed (unpaid or canceled): paying restores access right away,
   * so the action is "Pay now" rather than choosing a plan. False after an unpaid trial.
   */
  payToRestore?: boolean;
}

const READ_ONLY_STATUSES = new Set([
  "Expired",
  "Suspended",
  "Canceled",
  "None",
]);

/** A paid plan that lapsed (suspended for non-payment, or canceled) -- as opposed to an unpaid trial. */
export function lapsedPaidPlan(snapshot: EntitlementSnapshot): boolean {
  return (
    (snapshot.status === "Suspended" || snapshot.status === "Canceled") &&
    !!snapshot.currentPeriodEndUtc
  );
}

/**
 * Which subscription banner the company should see right now. The trial schedule counts days
 * to the trial's end: the first day welcomes, three days out says how many are left, the last
 * two days prompt for a plan (dismissible the day before, not on the final day). After the
 * trial or a missed payment, a read-only banner stays until a plan is paid.
 */
export function subscriptionBanner(
  snapshot: EntitlementSnapshot | undefined,
  trialDays: number,
  nowMs: number,
): SubscriptionBannerState | null {
  if (!snapshot) return null;

  if (
    snapshot.accessMode === "ReadOnly" ||
    READ_ONLY_STATUSES.has(snapshot.status)
  ) {
    return {
      kind: "read-only",
      dismissible: false,
      showPlanPopup: false,
      payToRestore: lapsedPaidPlan(snapshot),
    };
  }

  if (snapshot.status === "PastDue") {
    return {
      kind: "past-due",
      dismissible: false,
      showPlanPopup: false,
      date: snapshot.graceEndsAtUtc,
    };
  }

  if (snapshot.status === "Active" && snapshot.cancelAtPeriodEnd) {
    return {
      kind: "canceling",
      dismissible: true,
      showPlanPopup: false,
      date: snapshot.currentPeriodEndUtc,
    };
  }

  if (snapshot.status !== "Trialing" || !snapshot.trialEndsAtUtc) return null;

  const remainingMs = new Date(snapshot.trialEndsAtUtc).getTime() - nowMs;
  if (remainingMs <= 0) {
    return { kind: "read-only", dismissible: false, showPlanPopup: false };
  }

  // Today counts as a day: 1 = the last day, `trialDays` = the first.
  const remainingDays = Math.ceil(remainingMs / DAY_MS);
  const daysLeft = remainingDays - 1;
  const trial = (
    kind: SubscriptionBannerKind,
    dismissible: boolean,
    showPlanPopup: boolean,
  ): SubscriptionBannerState => ({
    kind,
    dismissible,
    showPlanPopup,
    daysLeft,
    date: snapshot.trialEndsAtUtc,
  });

  if (remainingDays >= trialDays) return trial("trial-welcome", true, false);
  if (daysLeft === 0) return trial("trial-ends-today", false, true);
  if (daysLeft === 1) return trial("trial-ends-tomorrow", true, true);
  if (daysLeft <= 3) return trial("trial-days-left", true, false);
  return null;
}

/** The local calendar day, for once-a-day prompts. */
export function localDayKey(nowMs: number): string {
  const d = new Date(nowMs);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
