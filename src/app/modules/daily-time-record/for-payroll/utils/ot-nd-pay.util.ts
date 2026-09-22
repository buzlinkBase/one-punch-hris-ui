import type { PayrollRunResult } from "../models/api/response/payroll-run-result.model";

// Mirrors PayrollSummaryReportDocument.cs (Hrms.Api) exactly, so the printed PDF, the Payroll
// Run preview, the Payroll Summary screen, and its exports never disagree. Under Additive mode,
// NDOT hours (both overtime AND night-differential) drop the day-type rate entirely and price
// exactly like OT-only hours plus a separate ND delta -- see
// NightDiffOTCategoryPolicies/OvertimeCategoryPolicies on the backend -- so their pay folds into
// BOTH the OT and ND totals. Under Compounded (default), NDOT keeps its own genuine 3-way
// day-rate x OT x ND cross-term that can't be reconstructed from just these two pieces, so it
// stays excluded from both, unchanged from before this feature existed.
export const isAdditiveMode = (r: PayrollRunResult) =>
  r.otNdCalculationMethod === "Additive";

// NDOT's raw-OT-rate portion ({Category}NDOTBasePay) and ND-delta portion
// ({Category}NDOTPremiumPay) are exactly what NDOT's blended pay decomposes into under Additive
// mode -- see PayrollSummaryReportDocument.NdotOtPortionPay/NdotNdPortionPay on the backend for
// the full rationale.
const ndotOtPortion = (r: PayrollRunResult) =>
  (r.regularNDOTBasePay ?? 0) +
  (r.restDayNDOTBasePay ?? 0) +
  (r.legalNDOTBasePay ?? 0) +
  (r.specialNDOTBasePay ?? 0) +
  (r.restLegalNDOTBasePay ?? 0) +
  (r.restSpecialNDOTBasePay ?? 0) +
  (r.doubleLegalNDOTBasePay ?? 0) +
  (r.restDoubleLegalNDOTBasePay ?? 0);

const ndotNdPortion = (r: PayrollRunResult) =>
  (r.regularNDOTPremiumPay ?? 0) +
  (r.restDayNDOTPremiumPay ?? 0) +
  (r.legalNDOTPremiumPay ?? 0) +
  (r.specialNDOTPremiumPay ?? 0) +
  (r.restLegalNDOTPremiumPay ?? 0) +
  (r.restSpecialNDOTPremiumPay ?? 0) +
  (r.doubleLegalNDOTPremiumPay ?? 0) +
  (r.restDoubleLegalNDOTPremiumPay ?? 0);

// overtimePay/nightDifferentialPay are themselves already mode-aware (each OT-only/ND-only
// policy branches its own Value on the mode server-side) -- only the NDOT top-up needs to be
// conditional here, so a Compounded-mode row's figures are unchanged from before this feature.
export const otPay = (r: PayrollRunResult) =>
  r.overtimePay + (isAdditiveMode(r) ? ndotOtPortion(r) : 0);

// Regular category's ND-only bucket's day-rate portion ({cat}NDBasePay) -- under Additive mode,
// this is what PayslipHoursDocument's BaseRow folds into "Regular Hours" instead of leaving it
// in "Night Diff.". Only Regular has a fold destination here (Basic is Regular-only by
// definition); the 6 holiday categories fold into Holiday instead (see holidayNdDayRatePortion
// below), and plain Rest Day's ND bucket has no separate Basic/Holiday-style column to fold
// into, so it deliberately stays untouched in both basicPay/holidayPay and ndPay.
const regularNdDayRatePortion = (r: PayrollRunResult) =>
  r.regularNDBasePay ?? 0;

const holidayNdDayRatePortion = (r: PayrollRunResult) =>
  (r.legalNDBasePay ?? 0) +
  (r.restLegalNDBasePay ?? 0) +
  (r.specialNDBasePay ?? 0) +
  (r.restSpecialNDBasePay ?? 0) +
  (r.doubleLegalNDBasePay ?? 0) +
  (r.restDoubleLegalNDBasePay ?? 0);

// The same 7 categories' ND-only premium ({cat}NDPremiumPay) -- what's left in the ND column
// under Additive once each category's day-rate portion above has moved to Basic/Holiday.
// Excludes plain Rest Day (restDayNDPay stays as its own full blended figure below, unmoved).
const ndOnlyPremiumPortion = (r: PayrollRunResult) =>
  (r.regularNDPremiumPay ?? 0) +
  (r.legalNDPremiumPay ?? 0) +
  (r.restLegalNDPremiumPay ?? 0) +
  (r.specialNDPremiumPay ?? 0) +
  (r.restSpecialNDPremiumPay ?? 0) +
  (r.doubleLegalNDPremiumPay ?? 0) +
  (r.restDoubleLegalNDPremiumPay ?? 0);

// "Basic"/"Holiday Total" as shown on the Earnings tab/Payroll Run preview specifically --
// paired 1:1 with otPay/ndPay/Holiday/Rest Day as a full decomposition of Gross Income. Under
// Additive mode this folds in each category's ND-hours day-rate portion, matching the Hours
// payslip's "Regular Hours"/"Special Holiday" rows exactly (PayslipHoursDocument.BaseRow does
// the identical fold, in both modes, for the payslip -- it's only conditional here because the
// non-folded figures already reconcile to Gross under Compounded on their own, and folding them
// there too would just be cosmetic). Compounded mode is byte-for-byte unchanged.
//
// NOT used by the separate Holiday Breakdown tab/sheet's own "Holiday Total" column -- that one
// sums fully self-contained per-category totals (holidayDuty, restLegalTotal, etc., already
// including every tier) that must NOT also receive this fold, or the day-rate portion would be
// double-counted within that row.
export const basicPay = (r: PayrollRunResult) =>
  r.basicPay + (isAdditiveMode(r) ? regularNdDayRatePortion(r) : 0);

export const holidayPay = (r: PayrollRunResult) =>
  r.holidayPay + (isAdditiveMode(r) ? holidayNdDayRatePortion(r) : 0);

// Under Compounded, unchanged: the full blended ND-only bucket value across all 8 categories
// (day-rate + premium together), same as always. Under Additive, becomes "premium only" for the
// 7 categories that now have their day-rate portion living in Basic/Holiday instead (see above),
// plus plain Rest Day's still-full blended value (no fold destination for it) and NDOT's own ND
// delta -- this exact rebalancing moves money between columns without changing the row's total,
// so Basic + OT + ND + Holiday + Rest Day still reconciles to Gross Income in both modes.
export const ndPay = (r: PayrollRunResult) => {
  if (!isAdditiveMode(r)) return r.nightDifferentialPay;
  return ndOnlyPremiumPortion(r) + (r.restDayNDPay ?? 0) + ndotNdPortion(r);
};

// For a dedicated "NDOT" column (Payroll Run's preview table): null under Additive, since the
// amount now lives in otPay/ndPay instead -- the caller renders this as "—" so the row's
// columns never look like they double-count against Gross Income.
export const ndotDisplayPay = (r: PayrollRunResult) =>
  isAdditiveMode(r) ? null : r.nightDifferentialOTPay;
