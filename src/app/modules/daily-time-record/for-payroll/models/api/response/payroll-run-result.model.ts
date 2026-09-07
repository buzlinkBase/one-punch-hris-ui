export interface PayrollRunResult {
  // Only populated when this row came from GET /payrolls (Payroll Summary — a persisted
  // record); Calculate/Generate preview responses have no saved Payroll.Id yet.
  id?: string;
  // Draft until explicitly posted (PayrollProcessorService.PostBatchAsync) — a
  // saved-but-unposted row can still be deleted; a posted one cannot. Only meaningful when
  // id is set.
  isPosted?: boolean;
  // Id of the PayrollBatch header row for the Generate run this row belongs to (assigned
  // once per run, not per employee) — see PayrollService.GetByBatchIdAsync /
  // DeleteByBatchIdAsync. Only meaningful when id is set.
  payrollBatchId?: string;
  // Free-text identity for the whole run, captured once at Generate time — see
  // PayrollRunRequest.remarks.
  remarks?: string | null;
  // "Regular" (DTR-cutoff-driven, the default) vs "ThirteenthMonth" (a lump-sum annual
  // payout — see GenerateThirteenthMonthRequest) vs "LastPay" (a separated employee's
  // final settlement — see GenerateLastPayRequest). Only meaningful when id is set.
  payrollType?: "Regular" | "ThirteenthMonth" | "LastPay";
  employeeId: string;
  fullName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payrollDate?: string;
  postingPeriod?: string;
  payDate?: string | null;
  salaryType: "VARIABLE" | "FIXED";
  dailyRate: number;
  // Earnings
  basicPay: number;
  // Sum of every pure OT category (excludes the ND-OT combo hours) — see backend
  // PayrollProcessorService.ComputeHoursBreakdown.
  overtimeHours: number;
  overtimePay: number;
  otPremiumPay?: number;
  nightDifferentialHour: number;
  nightDifferentialPay: number;
  nightDifferentialOTPay: number;
  ndPremiumPay?: number;
  // Rollup across all holiday-type days (worked + unworked) — see backend
  // Payroll.HolidayPay doc comment. Not "unworked only".
  holidayPay: number;
  legalHolidayUnworkedPay?: number;
  restDayPay: number;
  restDayOTPay?: number;
  restDayNDPay?: number;
  restDayNDOTPay?: number;
  // Leave-with-pay days for this cutoff — contributes to grossIncome but has no OT/ND/NDOT
  // component of its own, so it isn't folded into any of the categories above.
  paidLeaves?: number;
  // Informational only — the slice of paidLeaves funded by Government/Shared/Other (not
  // Company), proportioned from DTR LeavesInfo × Leave.PaySource. Does NOT add to
  // grossIncome: FIXED's Basic Pay already covers every day incl. Company-funded leave, and
  // VARIABLE's Regular pay already folds in paid-leave hours via DTR's Regular columns — see
  // backend PayrollProcessorService.ComputeNonCompanyPaidLeaves.
  nonCompanyPaidLeaves?: number;
  // Human-readable "which leave type(s), how many hours, paid/unpaid" behind paidLeaves —
  // see backend BuildPaidLeaveBreakdown.
  paidLeaveBreakdown?: string | null;
  // One-Time Leave Payout (LeaveApplication.PayoutMode == OneTime) — a leave-balance
  // cash-out, distinct from day-to-day paidLeaves above. companyFundedLeavePay is taxable
  // compensation (already folded into grossIncome); governmentFundedLeavePay is a
  // non-taxable government pass-through added straight to netPay instead — see backend
  // PayrollProcessorService.ApplyOneTimeLeavePayoutsToGross.
  governmentFundedLeavePay?: number;
  companyFundedLeavePay?: number;
  oneTimePayoutBreakdown?: string | null;
  // Raw per-holiday-category pay (base + OT + ND + NDOT tiers), same fields the payslip's
  // Holiday Breakdown section sums from — see PayslipDocument.cs on the backend. Optional:
  // only populated on rows sourced from a real Payroll/PayrollSummaryLine record.
  legalPay?: number;
  legalOTPay?: number;
  legalNDPay?: number;
  legalNDOTPay?: number;
  specialPay?: number;
  specialOTPay?: number;
  specialNDPay?: number;
  specialNDOTPay?: number;
  restLegalPay?: number;
  restLegalOTPay?: number;
  restLegalNDPay?: number;
  restLegalNDOTPay?: number;
  restSpecialPay?: number;
  restSpecialOTPay?: number;
  restSpecialNDPay?: number;
  restSpecialNDOTPay?: number;
  doubleLegalPay?: number;
  doubleLegalOTPay?: number;
  doubleLegalNDPay?: number;
  doubleLegalNDOTPay?: number;
  restDoubleLegalPay?: number;
  restDoubleLegalOTPay?: number;
  restDoubleLegalNDPay?: number;
  restDoubleLegalNDOTPay?: number;
  cola: number;
  totalRegularAllowances: number;
  totalBonuses: number;
  totalOtherIncome: number;
  totalDeminimises: number;
  totalCommissions: number;
  grossIncome: number;
  // Deductions
  sssContribution: number;
  philHealthContribution: number;
  pagIbigContribution: number;
  withholdingTax: number;
  otherDeductions: number;
  totalDeductions: number;
  totalLoans: number;
  // Attendance
  absences: number;
  absentCount: number;
  lateAmount: number;
  lateHours: number;
  underTimeAmount: number;
  underTimeHours: number;
  reimbursement: number;
  // Net
  netPay: number;
  nonTaxableBenefits: number;
  taxableBenefits: number;
  // Employer contributions
  employerSSSContribution: number;
  employerPhilHealthContribution: number;
  employerPagIbigContribution: number;
  employerECContribution: number;
  // Per-type DTR hours — optional: only populated on rows sourced from a real
  // Payroll/PayrollSummaryLine record (see backend ComputeHoursBreakdown), same convention
  // as the per-holiday-category pay fields above.
  regularNetHours?: number;
  regularOTHours?: number;
  regularNDHours?: number;
  regularNDOTHours?: number;
  restDayHours?: number;
  restDayOTHours?: number;
  restDayNDHours?: number;
  restDayNDOTHours?: number;
  legalHolHours?: number;
  legalHolOTHours?: number;
  legalHolNightDiffHours?: number;
  legalHolNightDiffOTHours?: number;
  specialHolHours?: number;
  specialHolOTHours?: number;
  specialHolNightDiffHours?: number;
  specialHolNightDiffOTHours?: number;
  restLegalDayHours?: number;
  restLegalDayOTHours?: number;
  restLegalDayNDHours?: number;
  restLegalDayNDOTHours?: number;
  restSpecialDayHours?: number;
  restSpecialDayOTHours?: number;
  restSpecialDayNDHours?: number;
  restSpecialDayNDOTHours?: number;
  doubleLegalHours?: number;
  doubleLegalOTHours?: number;
  doubleLegalNDHours?: number;
  doubleLegalNDOTHours?: number;
  restDoubleLegalHours?: number;
  restDoubleLegalOTHours?: number;
  restDoubleLegalNDHours?: number;
  restDoubleLegalNDOTHours?: number;
  obHours?: number;
  paidLeaveHours?: number;
  unpaidLeaveHours?: number;
  // Per-day pay breakdown behind this row's earnings/attendance totals above (backend
  // PayrollSummaryLine.TimeHourPayResults, one DTRPayModel per DTR day). Only populated on
  // a fresh Calculate/Generate preview response — Payroll (the persisted entity read back
  // via GET /payrolls) never stores this, so it's absent once a run has been saved and
  // re-fetched.
  timeHourPayResults?: DtrPayResult[];
}

// One day's contribution to a payroll line — mirrors backend DTRPayModel, using the same
// per-category grouping the DTR Detail table's Hours Breakdown uses (Regular / Rest Day /
// Legal Holiday / Special Holiday / Rest+Legal Day / Rest+Special Day / Double Legal Holiday
// / Rest+Double Legal, each split into base/OT/ND/ND-OT), just amounts instead of hours — see
// TimeHourPayResultsModal, which renders these with the identical column layout as
// dtr-detail-table.tsx. No Official Business amount exists (OB is hours/informational only,
// with no separate pay component in DTRPayModel), so that group has no amount equivalent here.
export interface DtrPayResult {
  date: string;
  // PascalCase enum name as serialized by the backend's global StringEnumConverter (e.g.
  // "RegularWorkDay", "LegalHolidayDuty") — space it out for display, same convention as
  // dtr-detail-table.tsx's own WorkType column.
  workType: string;
  // Regular
  regularDayPay: number;
  regularOTPay: number;
  regularNDPay: number;
  regularNDOTPay: number;
  // Rest Day
  restDayPay: number;
  restDayOTPay: number;
  restDayNDPay: number;
  restDayNDOTPay: number;
  // Legal Holiday
  legalPay: number;
  legalOTPay: number;
  legalNDPay: number;
  legalNDOTPay: number;
  // Special Holiday
  specialPay: number;
  specialOTPay: number;
  specialNDPay: number;
  specialNDOTPay: number;
  // Rest + Legal Day
  restLegalPay: number;
  restLegalOTPay: number;
  restLegalNDPay: number;
  restLegalNDOTPay: number;
  // Rest + Special Day
  restSpecialPay: number;
  restSpecialOTPay: number;
  restSpecialNDPay: number;
  restSpecialNDOTPay: number;
  // Double Legal Holiday
  doubleLegalPay: number;
  doubleLegalOTPay: number;
  doubleLegalNDPay: number;
  doubleLegalNDOTPay: number;
  // Rest + Double Legal
  restDoubleLegalPay: number;
  restDoubleLegalOTPay: number;
  restDoubleLegalNDPay: number;
  restDoubleLegalNDOTPay: number;
  // Minutes-band amount analogs (Late / Under Time / Absent)
  lateAmount: number;
  utAmount: number;
  absentAmount: number;
  // Leave
  paidLeave: number;
  unpaidLeave: number;
}

export interface PayrollRunResponse {
  data: PayrollRunResult[];
  total: number;
}
