import { describe, expect, it } from "vitest";
import {
  uniformAllowancePolicyFormSchema,
  type UniformAllowancePolicyFormValues,
} from "./uniform-allowance-policy.schema";
import {
  earliestEffectiveFrom,
  toPayload,
} from "../../services/uniform-allowance-policy.mapper";

const VALID: UniformAllowancePolicyFormValues = {
  effectiveFrom: "2026-11-01",
  isEnabled: true,
  frequency: "Monthly",
  creditDay: 1,
  startMonth: 1,
  amountMode: "FixedPerPeriod",
  amount: 500,
  expectedDaysPerPeriod: null,
  eligibleStatuses: ["Regular"],
  waitingMonths: 0,
  minPresentDays: 20,
  maxBalance: null,
  expiry: "CarryOver",
  expiryMonth: null,
  expiryAfterMonths: null,
  onSeparation: "KeepForRelease",
  rehireRule: "Restart",
  rehireBridgeDays: null,
  changeReason: "New contract",
};

const errorPaths = (values: UniformAllowancePolicyFormValues) => {
  const result = uniformAllowancePolicyFormSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((i) => i.path[0]);
};

describe("uniformAllowancePolicyFormSchema", () => {
  it("accepts a complete version", () => {
    expect(errorPaths(VALID)).toEqual([]);
  });

  it("needs the details each chosen option relies on", () => {
    expect(
      errorPaths({
        ...VALID,
        amount: 0,
        amountMode: "ProratedByPresentDays",
        expiry: "ResetAnnually",
        rehireRule: "BridgeWithinDays",
        eligibleStatuses: ["Resigned"],
        changeReason: " ",
      }).sort(),
    ).toEqual(
      [
        "amount",
        "changeReason",
        "eligibleStatuses",
        "expectedDaysPerPeriod",
        "expiryMonth",
        "rehireBridgeDays",
      ].sort(),
    );
  });

  it("needs only a reason to switch the allowance off", () => {
    expect(
      errorPaths({
        ...VALID,
        isEnabled: false,
        amount: null,
        eligibleStatuses: [],
      }),
    ).toEqual([]);
  });
});

describe("uniform allowance policy mapper", () => {
  it("clears fields the chosen options don't use", () => {
    const payload = toPayload({
      ...VALID,
      expectedDaysPerPeriod: 26,
      expiryMonth: 3,
      expiryAfterMonths: 6,
      rehireBridgeDays: 30,
      changeReason: "  New contract ",
    });

    expect(payload).toMatchObject({
      expectedDaysPerPeriod: null,
      expiryMonth: null,
      expiryAfterMonths: null,
      rehireBridgeDays: null,
      changeReason: "New contract",
    });
  });

  it("starts a change no earlier than the day after the last decided credit", () => {
    expect(earliestEffectiveFrom("2999-01-31")).toBe("2999-02-01");
    expect(earliestEffectiveFrom("2000-01-31") >= "2026-01-01").toBe(true);
  });
});
