import { describe, expect, it } from "vitest";
import type { AutoRenewResponse } from "../models/api/response/subscription-response.model";
import {
  autoRenewOf,
  autoRenewSummary,
  formatCardNumber,
  isCharging,
  parseExpiry,
} from "./auto-renew";

const on: AutoRenewResponse = {
  target: "Plan",
  status: "Active",
  billingCycle: "Monthly",
  paymentMethodLabel: "Visa •••• 4242",
  activatedAtUtc: "2026-10-01T00:00:00Z",
  nextChargeAtUtc: "2026-11-01T00:00:00Z",
  lastFailureAtUtc: null,
  lastFailureReason: null,
  canceledAtUtc: null,
  cancelReason: null,
};

describe("autoRenewOf", () => {
  it("picks the target's auto renew", () => {
    const storage = { ...on, target: "Storage" as const };
    expect(autoRenewOf([on, storage], "Storage")).toBe(storage);
    expect(autoRenewOf([on], "Storage")).toBeNull();
    expect(autoRenewOf(undefined, "Plan")).toBeNull();
  });
});

describe("isCharging", () => {
  it("counts on and retrying, not a setup still waiting for its first payment", () => {
    expect(isCharging(on)).toBe(true);
    expect(isCharging({ ...on, status: "PastDue" })).toBe(true);
    expect(isCharging({ ...on, status: "Pending" })).toBe(false);
    expect(isCharging(null)).toBe(false);
  });
});

describe("autoRenewSummary", () => {
  it("names the card and the next charge", () => {
    const summary = autoRenewSummary(on);
    expect(summary.type).toBe("success");
    expect(summary.message).toContain("Visa •••• 4242");
    expect(summary.message).toContain("Nov");
  });

  it("warns after a failed charge", () => {
    expect(autoRenewSummary({ ...on, status: "PastDue" }).type).toBe("warning");
  });

  it("says a setup is waiting for its first payment", () => {
    expect(autoRenewSummary({ ...on, status: "Pending" }).message).toContain(
      "first payment",
    );
  });
});

describe("card entry", () => {
  it("reads MM/YY and MM/YYYY expiries", () => {
    expect(parseExpiry("08/28")).toEqual({ month: 8, year: 2028 });
    expect(parseExpiry(" 8 / 2030 ")).toEqual({ month: 8, year: 2030 });
    expect(parseExpiry("13/28")).toBeNull();
    expect(parseExpiry("0828")).toBeNull();
  });

  it("groups the card number in fours", () => {
    expect(formatCardNumber("4343434343434345")).toBe("4343 4343 4343 4345");
    expect(formatCardNumber("4343-4343 x")).toBe("4343 4343");
  });
});
