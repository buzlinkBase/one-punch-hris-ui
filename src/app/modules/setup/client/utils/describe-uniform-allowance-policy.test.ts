import { describe, expect, it } from "vitest";
import {
  describeUniformAllowancePolicy,
  joinWords,
  type UniformAllowancePolicyRules,
} from "./describe-uniform-allowance-policy";

const BASE: UniformAllowancePolicyRules = {
  effectiveFrom: "2026-11-01",
  isEnabled: true,
  frequency: "Monthly",
  creditDay: 1,
  startMonth: 1,
  amountMode: "FixedPerPeriod",
  amount: 500,
  expectedDaysPerPeriod: null,
  eligibleStatuses: ["Regular", "Probationary"],
  waitingMonths: 1,
  minPresentDays: 20,
  maxBalance: null,
  expiry: "CarryOver",
  expiryMonth: null,
  expiryAfterMonths: null,
  onSeparation: "KeepForRelease",
  rehireRule: "Restart",
  rehireBridgeDays: null,
};

describe("describeUniformAllowancePolicy", () => {
  it("says when, how much, to whom and on what conditions", () => {
    expect(describeUniformAllowancePolicy(BASE).headline).toBe(
      "From Nov 1, 2026: credits ₱500.00 on the 1st of each month, for the month before, to Regular and Probationary employees with at least 20 present days in that period and after 1 month of service.",
    );
  });

  it("names the cycle months, the prorate rule and the anniversary", () => {
    expect(
      describeUniformAllowancePolicy({
        ...BASE,
        frequency: "Quarterly",
        creditDay: 15,
        startMonth: 2,
        amountMode: "ProratedByPresentDays",
        amount: 1500,
        expectedDaysPerPeriod: 66,
        minPresentDays: null,
        waitingMonths: 0,
      }).headline,
    ).toBe(
      "From Nov 1, 2026: credits up to ₱1,500.00 (prorated: full at 66 present days) on the 15th of Feb, May, Aug and Nov, each for the 3 months before, to Regular and Probationary employees.",
    );
    expect(
      describeUniformAllowancePolicy({
        ...BASE,
        frequency: "HireAnniversary",
        amountMode: "PerPresentDay",
        amount: 25,
      }).headline,
    ).toContain(
      "₱25.00 per present day on each employee's service anniversary",
    );
  });

  it("explains the cap, expiry, separation and rehire rules", () => {
    const { details } = describeUniformAllowancePolicy({
      ...BASE,
      maxBalance: 3000,
      expiry: "ResetAnnually",
      expiryMonth: 1,
      onSeparation: "Forfeit",
      rehireRule: "BridgeWithinDays",
      rehireBridgeDays: 30,
    });

    expect(details).toEqual([
      "The balance never goes above ₱3,000.00 — a credit that would pass it is cut to fit.",
      "Unused balance resets to zero every January 1.",
      "Employees on leave or suspended are skipped until they return.",
      "When an employee separates, their remaining balance is forfeited.",
      "A rehired employee who returns within 30 days keeps their earlier service; otherwise the waiting period starts again.",
    ]);
  });

  it("leaves out the start date for the legacy rules, and says so when switched off", () => {
    expect(
      describeUniformAllowancePolicy({ ...BASE, effectiveFrom: "0001-01-01" })
        .headline,
    ).toMatch(/^credits ₱500\.00/);
    expect(
      describeUniformAllowancePolicy({ ...BASE, isEnabled: false }).headline,
    ).toBe(
      "From Nov 1, 2026: no uniform allowance is credited to this client's employees.",
    );
  });

  it("skips the leave note when on-leave staff qualify", () => {
    const { details } = describeUniformAllowancePolicy({
      ...BASE,
      eligibleStatuses: ["Regular", "OnLeave"],
    });
    expect(details).toContain(
      "Employees suspended are skipped until they return.",
    );
  });
});

describe("joinWords", () => {
  it("joins with commas and a final and", () => {
    expect(joinWords(["A"])).toBe("A");
    expect(joinWords(["A", "B"])).toBe("A and B");
    expect(joinWords(["A", "B", "C"])).toBe("A, B and C");
  });
});
