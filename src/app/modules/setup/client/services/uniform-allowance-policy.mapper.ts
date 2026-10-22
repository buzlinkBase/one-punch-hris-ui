import dayjs from "dayjs";
import { phNow } from "@/shared/utils/ph-time.util";
import { DEFAULT_ELIGIBLE_STATUSES } from "../constants/uniform-allowance.const";
import type { UniformAllowancePolicyFormValues } from "../models/forms/uniform-allowance-policy.schema";
import type {
  UniformAllowancePolicy,
  UpsertUniformAllowancePolicy,
} from "../models/api/response/uniform-allowance-policy.model";

const DATE_FORMAT = "YYYY-MM-DD";

/**
 * The earliest day a new version may start: today (Philippine calendar), or the day after the
 * last credit the run decided, whichever is later.
 */
export function earliestEffectiveFrom(
  lastProcessedCreditDate: string | null,
): string {
  const today = phNow().format(DATE_FORMAT);
  if (!lastProcessedCreditDate) return today;
  const dayAfter = dayjs(lastProcessedCreditDate)
    .add(1, "day")
    .format(DATE_FORMAT);
  return dayAfter > today ? dayAfter : today;
}

/**
 * Form values for a version: a copy of `base` (the rules in force, or the version being edited)
 * starting on `effectiveFrom`, or sensible defaults for a client with no allowance yet. A copy
 * gets an empty reason -- every change says why.
 */
export function toFormValues(
  base: UniformAllowancePolicy | null,
  effectiveFrom: string,
  keepReason = false,
): UniformAllowancePolicyFormValues {
  return {
    effectiveFrom,
    isEnabled: base?.isEnabled ?? true,
    frequency: base?.frequency ?? "Monthly",
    creditDay: base?.creditDay ?? 1,
    startMonth: base?.startMonth ?? 1,
    amountMode: base?.amountMode ?? "FixedPerPeriod",
    amount: base?.amount ?? null,
    expectedDaysPerPeriod: base?.expectedDaysPerPeriod ?? null,
    eligibleStatuses: base?.eligibleStatuses ?? DEFAULT_ELIGIBLE_STATUSES,
    waitingMonths: base?.waitingMonths ?? 0,
    minPresentDays: base?.minPresentDays ?? null,
    maxBalance: base?.maxBalance ?? null,
    expiry: base?.expiry ?? "CarryOver",
    expiryMonth: base?.expiryMonth ?? null,
    expiryAfterMonths: base?.expiryAfterMonths ?? null,
    onSeparation: base?.onSeparation ?? "KeepForRelease",
    rehireRule: base?.rehireRule ?? "Restart",
    rehireBridgeDays: base?.rehireBridgeDays ?? null,
    changeReason: keepReason ? (base?.changeReason ?? "") : "",
  };
}

/** The API payload; fields the chosen options don't use are cleared. */
export function toPayload(
  v: UniformAllowancePolicyFormValues,
): UpsertUniformAllowancePolicy {
  return {
    ...v,
    amount: v.amount ?? 0,
    expectedDaysPerPeriod:
      v.amountMode === "ProratedByPresentDays" ? v.expectedDaysPerPeriod : null,
    expiryMonth: v.expiry === "ResetAnnually" ? v.expiryMonth : null,
    expiryAfterMonths:
      v.expiry === "ExpireAfterMonths" ? v.expiryAfterMonths : null,
    rehireBridgeDays:
      v.rehireRule === "BridgeWithinDays" ? v.rehireBridgeDays : null,
    changeReason: v.changeReason.trim(),
  };
}
