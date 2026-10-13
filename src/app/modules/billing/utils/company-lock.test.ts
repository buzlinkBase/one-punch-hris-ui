import { describe, expect, it } from "vitest";
import { isCompanyLocked } from "./company-lock";
import type { EntitlementSnapshot } from "../models/api/response/subscription-response.model";

const snapshot = (
  accessMode: EntitlementSnapshot["accessMode"],
): EntitlementSnapshot => ({
  tenantId: "t",
  ownerUserId: "o",
  planCode: "premium",
  planName: "Premium",
  status: accessMode === "ReadOnly" ? "Expired" : "Active",
  accessMode,
  features: {},
  limits: {},
  sources: {},
  supportTier: null,
  trialEndsAtUtc: null,
  currentPeriodEndUtc: null,
  graceEndsAtUtc: null,
  cancelAtPeriodEnd: false,
});

describe("isCompanyLocked", () => {
  it("locks members out when the owner's plan has lapsed", () => {
    expect(isCompanyLocked(snapshot("ReadOnly"), false)).toBe(true);
  });

  it("keeps the owner and billing admins in, read-only", () => {
    expect(isCompanyLocked(snapshot("ReadOnly"), true)).toBe(false);
  });

  it("closes the company to everyone, the owner too, when an operator restricts the account", () => {
    const restricted: EntitlementSnapshot = {
      ...snapshot("Full"),
      restriction: { kind: "LegalHold", reason: null },
    };
    expect(isCompanyLocked(restricted, true)).toBe(true);
    expect(isCompanyLocked(restricted, false)).toBe(true);
  });

  it("locks no one while the plan is current, or before it loads", () => {
    expect(isCompanyLocked(snapshot("Full"), false)).toBe(false);
    expect(isCompanyLocked(undefined, false)).toBe(false);
  });
});
