import type { ThirteenthMonthResponse } from "../models/api/response/payroll-reports.model";

type ThirteenthMonthStatus = ThirteenthMonthResponse["status"];

// One set of plain-language words for the 13th month figures, shared by the report, its
// export and the employee portal so they never describe the same number differently.
export const THIRTEENTH_MONTH_LABEL = {
  BASIC_PAY: "Basic Pay Earned (Year to Date)",
  SPECIAL_BONUSES: "Special Bonuses Paid",
  EARNED: "13th Month Earned",
  STATUS: "Status",
  RELEASED: "Amount Released (after tax)",
  STILL_UNPAID: "Still Unpaid",
} as const;

export const THIRTEENTH_MONTH_HINT = {
  BASIC_PAY:
    "Basic pay from this year's posted regular payrolls. It grows with every cutoff that is posted.",
  SPECIAL_BONUSES:
    "Bonuses that share the tax-free ceiling (₱90,000 by default) with the 13th month.",
  EARNED:
    "Basic Pay Earned ÷ 12, as of today. It keeps growing until the year's last cutoff is posted.",
  STATUS:
    "Where the 13th month payout stands: not yet generated, generated but not released, or released.",
  RELEASED:
    "What the 13th month payout actually paid, after withholding tax on any amount above the tax-free ceiling. It is fixed on the day the payout was generated.",
  STILL_UNPAID:
    "13th Month Earned minus the payout's amount before tax: what was earned in cutoffs posted after the payout was generated.",
} as const;

export const THIRTEENTH_MONTH_STATUS_LABEL: Record<
  ThirteenthMonthStatus,
  string
> = {
  NotGenerated: "Not yet generated",
  Draft: "Generated, not released",
  Posted: "Released",
};

export const THIRTEENTH_MONTH_STATUS_COLOR: Record<
  ThirteenthMonthStatus,
  "success" | "processing" | "default"
> = {
  NotGenerated: "default",
  Draft: "processing",
  Posted: "success",
};

/** Whether part of the 13th month earned so far isn't covered by the payout (shown highlighted). */
export const isStillUnpaid = (
  row: Pick<ThirteenthMonthResponse, "stillUnpaid">,
): boolean => (row.stillUnpaid ?? 0) > 0;
