import { describe, expect, it } from "vitest";
import { msUntilNextBoundary } from "./next-boundary";
import type { EntitlementSnapshot } from "../models/api/response/subscription-response.model";

const NOW = Date.UTC(2026, 9, 10, 9, 0, 0);
const at = (offsetMs: number) => new Date(NOW + offsetMs).toISOString();

const snapshot = (
  overrides: Partial<EntitlementSnapshot> = {},
): EntitlementSnapshot => ({
  tenantId: "t",
  ownerUserId: "o",
  planCode: "payroll",
  planName: "Payroll",
  status: "Active",
  accessMode: "Full",
  features: {},
  limits: {},
  sources: {},
  supportTier: null,
  trialEndsAtUtc: null,
  currentPeriodEndUtc: null,
  graceEndsAtUtc: null,
  cancelAtPeriodEnd: false,
  ...overrides,
});

describe("msUntilNextBoundary", () => {
  it("waits for the soonest upcoming date, plus a second", () => {
    const wait = msUntilNextBoundary(
      snapshot({
        trialEndsAtUtc: at(60 * 60 * 1000),
        currentPeriodEndUtc: at(30_000),
        graceEndsAtUtc: at(7 * 24 * 60 * 60 * 1000),
      }),
      NOW,
    );
    expect(wait).toBe(31_000);
  });

  it("ignores dates already passed", () => {
    expect(
      msUntilNextBoundary(
        snapshot({ currentPeriodEndUtc: at(-1000), graceEndsAtUtc: at(5000) }),
        NOW,
      ),
    ).toBe(6000);
  });

  it("has nothing to wait for once read-only, or with no future date", () => {
    expect(
      msUntilNextBoundary(
        snapshot({ accessMode: "ReadOnly", graceEndsAtUtc: at(5000) }),
        NOW,
      ),
    ).toBeNull();
    expect(msUntilNextBoundary(snapshot(), NOW)).toBeNull();
    expect(msUntilNextBoundary(undefined, NOW)).toBeNull();
  });

  it("skips dates too far off for a timer", () => {
    expect(
      msUntilNextBoundary(
        snapshot({ currentPeriodEndUtc: at(30 * 24 * 60 * 60 * 1000) }),
        NOW,
      ),
    ).toBeNull();
  });
});
