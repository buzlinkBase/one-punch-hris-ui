import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";

export const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });
export const fmtH = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 }) + " h";

// Holiday-category totals, mirroring PayslipDocument.cs's formulas exactly — each folds
// its own base + OT + ND + NDOT tiers into one figure; "Holiday Duty" excludes the
// unworked portion of Legal Holiday pay, and "Double Legal" folds in the rest-day variant.
// Shared by holiday.columns.tsx and payroll-summary-export.util.ts.
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
