import { EMPLOYMENT_STATUS_OPTIONS } from "@/app/modules/setup/employee/constants/label.const";
import type {
  UniformAmountMode,
  UniformBalanceExpiry,
  UniformCreditFrequency,
  UniformCreditOutcome,
  UniformRehireRule,
  UniformSeparationRule,
} from "../models/api/response/uniform-allowance-policy.model";

/** Statuses that mean the employee has left -- they can never qualify. */
export const SEPARATED_STATUSES = [
  "Terminated",
  "Resigned",
  "Retired",
  "Deceased",
];

export const QUALIFYING_STATUS_OPTIONS = EMPLOYMENT_STATUS_OPTIONS.filter(
  (o) => !SEPARATED_STATUSES.includes(o.value),
);

export const DEFAULT_ELIGIBLE_STATUSES = [
  "Regular",
  "Probationary",
  "Contract",
];

export const UNIFORM_FREQUENCY_OPTIONS: {
  value: UniformCreditFrequency;
  label: string;
}[] = [
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly (every 3 months)" },
  { value: "SemiAnnual", label: "Semi-annual (every 6 months)" },
  { value: "Annual", label: "Annual" },
  { value: "HireAnniversary", label: "On each employee's service anniversary" },
];

/** Months between credits, for the calendar cycles. */
export const UNIFORM_CYCLE_MONTHS: Partial<
  Record<UniformCreditFrequency, number>
> = {
  Monthly: 1,
  Quarterly: 3,
  SemiAnnual: 6,
  Annual: 12,
};

export const UNIFORM_AMOUNT_MODE_OPTIONS: {
  value: UniformAmountMode;
  label: string;
}[] = [
  { value: "FixedPerPeriod", label: "Fixed amount each period" },
  {
    value: "ProratedByPresentDays",
    label: "Prorated by present days",
  },
  { value: "PerPresentDay", label: "Amount per present day" },
];

export const UNIFORM_EXPIRY_OPTIONS: {
  value: UniformBalanceExpiry;
  label: string;
}[] = [
  { value: "CarryOver", label: "Carries over (never expires)" },
  { value: "ResetAnnually", label: "Resets to zero once a year" },
  { value: "ExpireAfterMonths", label: "Each credit expires after N months" },
];

export const UNIFORM_SEPARATION_OPTIONS: {
  value: UniformSeparationRule;
  label: string;
}[] = [
  {
    value: "KeepForRelease",
    label: "Keep the balance for release with last pay",
  },
  { value: "Forfeit", label: "Forfeit the remaining balance" },
];

export const UNIFORM_REHIRE_OPTIONS: {
  value: UniformRehireRule;
  label: string;
}[] = [
  { value: "Restart", label: "Start the waiting period again" },
  {
    value: "BridgeWithinDays",
    label: "Keep earlier service if rehired within N days",
  },
];

export const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, i) => ({ value: i + 1, label }));

export const CREDIT_DAY_OPTIONS = Array.from({ length: 28 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1),
}));

export const UNIFORM_OUTCOME_TAG: Record<
  UniformCreditOutcome,
  { color: string; label: string }
> = {
  Credited: { color: "green", label: "Credited" },
  Capped: { color: "orange", label: "Capped" },
  Skipped: { color: "default", label: "Skipped" },
};

export const UNIFORM_ALLOWANCE_LABEL = {
  TAB: "Uniform Allowance",
  RULES_TITLE: "Rules",
  NEXT_CREDITS: "Next credits",
  HISTORY: "Version history",
  NEW_VERSION: "Schedule a change",
  LEGACY_NOTE:
    "This client still uses its original settings. Saving here replaces them from the start date you pick.",
  LOCKED_NOTE:
    "Credits have already been decided under this version, so it can't be changed. Schedule a new version instead.",
};
