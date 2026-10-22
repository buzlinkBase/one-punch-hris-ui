import { z } from "zod";
import { SEPARATED_STATUSES } from "../../constants/uniform-allowance.const";

// Client Settings > Uniform Allowance -- one policy version. Mirrors hrms-api's
// UniformAllowancePolicyService.Validate, so the form says what's wrong before the API does.
export const uniformAllowancePolicyFormSchema = z
  .object({
    effectiveFrom: z.string().min(1, "Pick the day the change starts"),
    isEnabled: z.boolean(),
    frequency: z.enum([
      "Monthly",
      "Quarterly",
      "SemiAnnual",
      "Annual",
      "HireAnniversary",
    ]),
    creditDay: z.number().int().min(1).max(28),
    startMonth: z.number().int().min(1).max(12),
    amountMode: z.enum([
      "FixedPerPeriod",
      "ProratedByPresentDays",
      "PerPresentDay",
    ]),
    amount: z.number().nullable(),
    expectedDaysPerPeriod: z.number().int().nullable(),
    eligibleStatuses: z.array(z.string()),
    waitingMonths: z
      .number()
      .int()
      .min(0, "Can't be negative")
      .max(120, "At most 120 months"),
    minPresentDays: z.number().int().min(0, "Can't be negative").nullable(),
    maxBalance: z.number().nullable(),
    expiry: z.enum(["CarryOver", "ResetAnnually", "ExpireAfterMonths"]),
    expiryMonth: z.number().int().nullable(),
    expiryAfterMonths: z.number().int().nullable(),
    onSeparation: z.enum(["KeepForRelease", "Forfeit"]),
    rehireRule: z.enum(["Restart", "BridgeWithinDays"]),
    rehireBridgeDays: z.number().int().nullable(),
    changeReason: z.string().trim().min(1, "Say why the rules are changing"),
  })
  .superRefine((v, ctx) => {
    if (!v.isEnabled) return;
    const fail = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    if (!v.amount || v.amount <= 0)
      fail("amount", "Enter an amount above zero");
    if (
      v.amountMode === "ProratedByPresentDays" &&
      !(v.expectedDaysPerPeriod && v.expectedDaysPerPeriod > 0)
    )
      fail(
        "expectedDaysPerPeriod",
        "Enter the present days that earn the full amount",
      );
    if (v.eligibleStatuses.length === 0)
      fail("eligibleStatuses", "Pick at least one status that qualifies");
    if (v.eligibleStatuses.some((s) => SEPARATED_STATUSES.includes(s)))
      fail("eligibleStatuses", "Separated employees can't qualify");
    if (v.maxBalance !== null && v.maxBalance <= 0)
      fail("maxBalance", "Must be above zero (or leave empty for no cap)");
    if (
      v.expiry === "ResetAnnually" &&
      !(v.expiryMonth && v.expiryMonth >= 1 && v.expiryMonth <= 12)
    )
      fail("expiryMonth", "Pick the month the balance resets");
    if (
      v.expiry === "ExpireAfterMonths" &&
      !(
        v.expiryAfterMonths &&
        v.expiryAfterMonths >= 1 &&
        v.expiryAfterMonths <= 120
      )
    )
      fail("expiryAfterMonths", "Enter 1 to 120 months");
    if (
      v.rehireRule === "BridgeWithinDays" &&
      !(
        v.rehireBridgeDays &&
        v.rehireBridgeDays >= 1 &&
        v.rehireBridgeDays <= 3650
      )
    )
      fail("rehireBridgeDays", "Enter 1 to 3,650 days");
  });

export type UniformAllowancePolicyFormValues = z.infer<
  typeof uniformAllowancePolicyFormSchema
>;
