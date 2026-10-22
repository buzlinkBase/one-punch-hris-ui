import type { LedgerEntryResponse } from "@/app/modules/reports/payroll-reports/models/api/response/payroll-reports.model";

/** Mirrors hrms-api's uniform allowance policy enums (sent as names). */
export type UniformCreditFrequency =
  "Monthly" | "Quarterly" | "SemiAnnual" | "Annual" | "HireAnniversary";

export type UniformAmountMode =
  "FixedPerPeriod" | "ProratedByPresentDays" | "PerPresentDay";

export type UniformBalanceExpiry =
  "CarryOver" | "ResetAnnually" | "ExpireAfterMonths";

export type UniformSeparationRule = "KeepForRelease" | "Forfeit";

export type UniformRehireRule = "Restart" | "BridgeWithinDays";

export type UniformCreditOutcome = "Credited" | "Capped" | "Skipped";

/** A new version, or a change to one that hasn't started (hrms-api UpsertUniformAllowancePolicy). */
export interface UpsertUniformAllowancePolicy {
  effectiveFrom: string;
  isEnabled: boolean;
  frequency: UniformCreditFrequency;
  creditDay: number;
  startMonth: number;
  amountMode: UniformAmountMode;
  amount: number;
  expectedDaysPerPeriod: number | null;
  eligibleStatuses: string[];
  waitingMonths: number;
  minPresentDays: number | null;
  maxBalance: number | null;
  expiry: UniformBalanceExpiry;
  expiryMonth: number | null;
  expiryAfterMonths: number | null;
  onSeparation: UniformSeparationRule;
  rehireRule: UniformRehireRule;
  rehireBridgeDays: number | null;
  changeReason: string;
}

/** A saved version, or (id null, isLegacy) the client's settings from before policies. */
export interface UniformAllowancePolicy extends UpsertUniformAllowancePolicy {
  id: string | null;
  clientId: string;
  createdAt: string | null;
  createdByName: string;
  /** Started on or before the last credit run -- read-only. */
  isLocked: boolean;
  isLegacy: boolean;
}

export interface UniformAllowancePolicyList {
  versions: UniformAllowancePolicy[];
  legacy: UniformAllowancePolicy | null;
  currentPolicyId: string | null;
  /** New versions must start after this day. */
  lastProcessedCreditDate: string | null;
}

export interface UniformCreditPreview {
  creditDate: string;
  periodStart: string;
  periodEnd: string;
  policyId: string | null;
  /** Known up front only for a fixed amount (before any cap). */
  amount: number | null;
  condition: string;
}

export interface UniformUpcomingCredit extends UniformCreditPreview {
  /** Why it won't be credited as things stand; empty when it should be. */
  blocker: string;
}

export interface UniformAllowanceCreditLog {
  id: string;
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  clientId: string;
  clientName: string;
  policyId: string | null;
  creditDate: string;
  periodStart: string;
  periodEnd: string;
  outcome: UniformCreditOutcome;
  reasonCode: string;
  reasonText: string;
  presentDays: number | null;
  requiredDays: number | null;
  amount: number;
}

export interface UniformAllowanceCreditLogFilter {
  from?: string;
  to?: string;
  clientId?: string;
  employeeId?: string;
  outcome?: UniformCreditOutcome;
}

export interface UniformAllowanceSchedule {
  employeeId: string;
  balance: number;
  serviceStartDate: string | null;
  separatedOn: string | null;
  policy: UniformAllowancePolicy | null;
  history: UniformAllowanceCreditLog[];
  upcoming: UniformUpcomingCredit[];
}

export interface MyUniformAllowance extends UniformAllowanceSchedule {
  entries: LedgerEntryResponse[];
}
