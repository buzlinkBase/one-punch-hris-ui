import { describe, expect, it } from "vitest";
import { findFeatureLock } from "./feature-lock";
import type { EntitlementsResponse } from "../models/api/response/subscription-response.model";

const view = (
  features: Record<string, boolean>,
  sources: Record<string, string> = {},
): EntitlementsResponse => ({
  entitlements: {
    tenantId: "t",
    ownerUserId: "o",
    planCode: "timekeeping",
    planName: "Timekeeping",
    status: "Active",
    accessMode: "Full",
    features,
    limits: {},
    sources,
    supportTier: "email",
    trialEndsAtUtc: null,
    currentPeriodEndUtc: null,
    graceEndsAtUtc: null,
    cancelAtPeriodEnd: false,
  },
  featureAvailableOn: { "payroll.core": "Payroll", analytics: "Premium" },
});

describe("findFeatureLock", () => {
  it("locks a feature the plan lacks, naming the plan that has it", () => {
    expect(
      findFeatureLock(["payroll.core"], view({ "payroll.core": false })),
    ).toEqual({
      feature: "payroll.core",
      reason: "upgrade",
      availableOn: "Payroll",
    });
  });

  it("offers no upgrade for a feature an override took away", () => {
    const lock = findFeatureLock(
      ["analytics"],
      view({ analytics: false }, { analytics: "account-override" }),
    );

    expect(lock).toEqual({
      feature: "analytics",
      reason: "revoked",
      availableOn: null,
    });
  });

  it("needs every feature on the chain", () => {
    expect(
      findFeatureLock(
        ["portal.self_service", "payroll.core"],
        view({ "portal.self_service": true, "payroll.core": false }),
      )?.feature,
    ).toBe("payroll.core");
  });

  it("locks nothing that's included, or before entitlements load", () => {
    expect(
      findFeatureLock(["payroll.core"], view({ "payroll.core": true })),
    ).toBeNull();
    expect(findFeatureLock(["payroll.core"], undefined)).toBeNull();
  });
});
