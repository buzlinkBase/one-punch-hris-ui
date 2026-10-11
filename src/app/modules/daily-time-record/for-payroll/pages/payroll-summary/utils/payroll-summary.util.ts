import type {
  PayrollBreakdownItem,
  PayrollRunResult,
} from "../../../models/api/response/payroll-run-result.model";

// Exactly 2 decimals — a minimum alone lets toLocaleString show 3 (1.0333 -> "1.033").
const TWO_DECIMALS = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

export const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", TWO_DECIMALS);
export const fmtH = (n: number) => fmt(n) + " h";

// Holiday-category totals, mirroring PayslipDocument.cs's formulas exactly — each folds
// its own base + OT + ND + NDOT tiers into one figure; "Holiday Duty" excludes the
// unworked portion of Legal Holiday pay, and "Double Legal" folds in the rest-day variant.
// Shared by payroll.columns.tsx and payroll-summary-export.util.ts.
export function holidayDuty(r: PayrollRunResult) {
  return (
    (r.legalPay ?? 0) -
    (r.legalHolidayUnworkedPay ?? 0) +
    (r.legalOTPay ?? 0) +
    (r.legalNDPay ?? 0) +
    (r.legalNDOTPay ?? 0)
  );
}
export function restLegalTotal(r: PayrollRunResult) {
  return (
    (r.restLegalPay ?? 0) +
    (r.restLegalOTPay ?? 0) +
    (r.restLegalNDPay ?? 0) +
    (r.restLegalNDOTPay ?? 0)
  );
}
export function restSpecialTotal(r: PayrollRunResult) {
  return (
    (r.restSpecialPay ?? 0) +
    (r.restSpecialOTPay ?? 0) +
    (r.restSpecialNDPay ?? 0) +
    (r.restSpecialNDOTPay ?? 0)
  );
}
export function specialTotal(r: PayrollRunResult) {
  return (
    (r.specialPay ?? 0) +
    (r.specialOTPay ?? 0) +
    (r.specialNDPay ?? 0) +
    (r.specialNDOTPay ?? 0)
  );
}
export function doubleLegalTotal(r: PayrollRunResult) {
  return (
    (r.doubleLegalPay ?? 0) +
    (r.doubleLegalOTPay ?? 0) +
    (r.doubleLegalNDPay ?? 0) +
    (r.doubleLegalNDOTPay ?? 0)
  );
}
export function restDoubleLegalTotal(r: PayrollRunResult) {
  return (
    (r.restDoubleLegalPay ?? 0) +
    (r.restDoubleLegalOTPay ?? 0) +
    (r.restDoubleLegalNDPay ?? 0) +
    (r.restDoubleLegalNDOTPay ?? 0)
  );
}
export function restDayTotal(r: PayrollRunResult) {
  return (
    (r.restDayPay ?? 0) +
    (r.restDayOTPay ?? 0) +
    (r.restDayNDPay ?? 0) +
    (r.restDayNDOTPay ?? 0)
  );
}

// A total that expands into one column per type — Loans, Other Deductions and Other Income all
// follow this shape, so the screen's collapsible groups and the Excel/CSV exports share one set
// of helpers below instead of a copy per group. `total` is the figure shown when collapsed;
// `include` picks which of the row's items belong to this group.
export interface BreakdownSpec {
  items: (r: PayrollRunResult) => PayrollBreakdownItem[] | undefined;
  include: (item: PayrollBreakdownItem) => boolean;
  total: (r: PayrollRunResult) => number;
}

export const loansBreakdown: BreakdownSpec = {
  items: (r) => r.deductionItems,
  include: (i) => !!i.isLoan,
  total: (r) => r.totalLoans,
};
export const otherDeductionsBreakdown: BreakdownSpec = {
  items: (r) => r.deductionItems,
  include: (i) => !i.isLoan,
  total: (r) => r.otherDeductions - r.totalLoans,
};
export const otherIncomeBreakdown: BreakdownSpec = {
  items: (r) => r.incomeItems,
  include: () => true,
  total: (r) => r.totalOtherIncome,
};

const itemsOf = (r: PayrollRunResult, spec: BreakdownSpec) =>
  (spec.items(r) ?? []).filter(spec.include);

// Every type paid to anyone in `results`, once each, A-Z — the columns of the expanded group.
export function breakdownTypes(
  results: PayrollRunResult[],
  spec: BreakdownSpec,
): { itemId: string; label: string }[] {
  const types = new Map<string, string>();
  for (const r of results)
    for (const i of itemsOf(r, spec))
      if (!types.has(i.itemId)) types.set(i.itemId, i.label);
  return [...types]
    .map(([itemId, label]) => ({ itemId, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export const breakdownAmount = (
  r: PayrollRunResult,
  spec: BreakdownSpec,
  itemId: string,
) =>
  itemsOf(r, spec)
    .filter((i) => i.itemId === itemId)
    .reduce((s, i) => s + i.amount, 0);

// What the total holds beyond its itemized types — Salary Adjustments, or a run saved before
// items were recorded. Keeps "items + adjustments = total" true on every row.
export const breakdownRemainder = (r: PayrollRunResult, spec: BreakdownSpec) =>
  spec.total(r) - itemsOf(r, spec).reduce((s, i) => s + i.amount, 0);

// Cents-level tolerance, same as the backend report, so float noise never adds an empty column.
export const hasBreakdownRemainder = (
  results: PayrollRunResult[],
  spec: BreakdownSpec,
) => results.some((r) => Math.abs(breakdownRemainder(r, spec)) >= 0.005);
