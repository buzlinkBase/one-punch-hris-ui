import { describe, expect, it } from "vitest";
import { localDayKey, subscriptionBanner } from "./trial-schedule";
import type { EntitlementSnapshot } from "../models/api/response/subscription-response.model";

const DAY = 24 * 60 * 60 * 1000;
const TRIAL_START = Date.UTC(2026, 9, 1, 8, 0, 0);
const TRIAL_ENDS = new Date(TRIAL_START + 7 * DAY).toISOString();

const snapshot = (
  overrides: Partial<EntitlementSnapshot> = {},
): EntitlementSnapshot => ({
  tenantId: "t",
  ownerUserId: "o",
  planCode: "premium",
  planName: "Premium",
  status: "Trialing",
  accessMode: "Full",
  features: {},
  limits: {},
  sources: {},
  supportTier: "priority",
  trialEndsAtUtc: TRIAL_ENDS,
  currentPeriodEndUtc: null,
  graceEndsAtUtc: null,
  cancelAtPeriodEnd: false,
  ...overrides,
});

/** The banner shown `day` days into the trial (day 1 = the first), an hour in. */
const onDay = (day: number) =>
  subscriptionBanner(snapshot(), 7, TRIAL_START + (day - 1) * DAY + 3_600_000);

describe("subscriptionBanner -- the trial schedule", () => {
  it("welcomes on day 1, then stays quiet on days 2 and 3", () => {
    expect(onDay(1)?.kind).toBe("trial-welcome");
    expect(onDay(2)).toBeNull();
    expect(onDay(3)).toBeNull();
  });

  it("counts down from day 4, dismissibly", () => {
    expect(onDay(4)).toMatchObject({
      kind: "trial-days-left",
      daysLeft: 3,
      dismissible: true,
      showPlanPopup: false,
    });
  });

  it("prompts for a plan on day 6, dismissibly", () => {
    expect(onDay(6)).toMatchObject({
      kind: "trial-ends-tomorrow",
      dismissible: true,
      showPlanPopup: true,
    });
  });

  it("can't be dismissed on the last day", () => {
    expect(onDay(7)).toMatchObject({
      kind: "trial-ends-today",
      dismissible: false,
      showPlanPopup: true,
    });
  });

  it("goes read-only once the trial is over", () => {
    expect(onDay(8)?.kind).toBe("read-only");
  });
});

describe("subscriptionBanner -- paying restores a lapsed paid plan", () => {
  it("asks to pay when a paid plan was suspended, not after an unpaid trial", () => {
    const paid = snapshot({
      status: "Suspended",
      accessMode: "ReadOnly",
      currentPeriodEndUtc: "2026-09-30T00:00:00Z",
    });
    const trial = snapshot({ status: "Expired", accessMode: "ReadOnly" });

    expect(subscriptionBanner(paid, 7, TRIAL_START)?.payToRestore).toBe(true);
    expect(subscriptionBanner(trial, 7, TRIAL_START)?.payToRestore).toBe(false);
  });
});

describe("subscriptionBanner -- after the trial", () => {
  it("keeps read-only accounts on a permanent banner", () => {
    for (const status of ["Expired", "Suspended", "Canceled"] as const) {
      expect(
        subscriptionBanner(
          snapshot({ status, accessMode: "ReadOnly" }),
          7,
          TRIAL_START,
        ),
      ).toMatchObject({ kind: "read-only", dismissible: false });
    }
  });

  it("warns during the past-due grace period", () => {
    const grace = new Date(TRIAL_START + 5 * DAY).toISOString();
    expect(
      subscriptionBanner(
        snapshot({ status: "PastDue", graceEndsAtUtc: grace }),
        7,
        TRIAL_START,
      ),
    ).toMatchObject({ kind: "past-due", dismissible: false, date: grace });
  });

  it("reminds a paid account that canceled when access ends", () => {
    expect(
      subscriptionBanner(
        snapshot({ status: "Active", cancelAtPeriodEnd: true }),
        7,
        TRIAL_START,
      )?.kind,
    ).toBe("canceling");
  });

  it("shows nothing while a new company is still setting up", () => {
    expect(
      subscriptionBanner(
        snapshot({ status: "Provisioning", trialEndsAtUtc: null }),
        7,
        TRIAL_START,
      ),
    ).toBeNull();
  });

  it("shows nothing for a paid, current account", () => {
    expect(
      subscriptionBanner(snapshot({ status: "Active" }), 7, TRIAL_START),
    ).toBeNull();
  });
});

describe("localDayKey", () => {
  it("changes at local midnight only", () => {
    const morning = new Date(2026, 9, 5, 8, 0, 0).getTime();
    const evening = new Date(2026, 9, 5, 22, 0, 0).getTime();
    const nextDay = new Date(2026, 9, 6, 0, 1, 0).getTime();

    expect(localDayKey(morning)).toBe(localDayKey(evening));
    expect(localDayKey(nextDay)).not.toBe(localDayKey(evening));
  });
});
