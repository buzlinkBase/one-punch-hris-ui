// Mirrors backend TaxAnnualizationPreviewModel — one row per in-scope employee, returned by
// both the preview and generate endpoints (Generate re-derives the same figures right before
// persisting, so its response has this same shape plus the persisted Payroll fields).
export interface TaxAnnualizationPreview {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  year: number;
  // This employer's own raw components for the year — informational (e.g. for a "current
  // employer only" breakdown), not the final combined figures below.
  currentGrossIncome: number;
  currentNonTaxableBenefits: number;
  currentStatutoryDeductions: number;
  currentWithholdingTaxYTD: number;
  currentAverageMonthlyNetPay: number;
  // Minimum Wage Earners are excluded from annualization entirely (zero adjustment).
  isMinimumWageEarner: boolean;
  // MWE status couldn't be resolved (missing Branch/Region/MinimumWageRate data) — defaulted
  // to non-MWE. Flag the employee's Branch/Region setup before relying on the adjustment.
  isUnclassified: boolean;
  // True when a PriorEmployerTaxRecord (BIR 2316 from a previous job this year) was found and
  // folded into the combined figures below.
  hasPriorEmployerData: boolean;
  priorEmployerGrossIncome: number;
  priorEmployerTaxWithheld: number;
  // Current + prior employer, netted, floored at 0, rounded to 2dp — the actual figures the
  // bracket lookup and adjustment are computed from.
  annualGrossIncome: number;
  annualTaxableIncome: number;
  annualWithholdingTaxYTD: number;
  // AnnualTaxCalculator.GetAnnualTaxDue(brackets, annualTaxableIncome) — 0 for MWEs.
  annualTaxDue: number;
  // annualTaxDue - annualWithholdingTaxYTD. Positive = additional tax to collect (employee
  // under-withheld this year); negative = refund (employee over-withheld). Always 0 for MWEs.
  adjustmentAmount: number;
  isRefund: boolean;
  // A collection (not a refund) larger than a configurable multiple of the employee's average
  // monthly net pay — informational only, never blocks Generate. See Payroll Settings' "Large
  // Tax Collection Warning Multiplier".
  exceedsLargeCollectionWarning: boolean;
  // True when this employee already has a YearEndAdjustment Payroll row for the year — shown
  // for HR transparency in Preview, excluded (not silently skipped) from Generate.
  alreadyGenerated: boolean;
}

export interface TaxAnnualizationPreviewResponse {
  data: TaxAnnualizationPreview[];
  total: number;
}
