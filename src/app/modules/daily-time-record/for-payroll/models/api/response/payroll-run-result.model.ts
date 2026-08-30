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
  overtimeHour: number;
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
  // Subset of paidLeaves funded by Government/Shared/Other (not Company) — for FIXED
  // employees this is the only slice of paidLeaves that's a real addition to grossIncome,
  // since Company-funded paid leave is already embedded in their flat monthly rate.
  nonCompanyPaidLeaves?: number;
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
  // Per-type DTR hours
  regularNetHours: number;
  regularOTHours: number;
  regularNDHours: number;
  regularNDOTHours: number;
  restDayHours: number;
  restDayOTHours: number;
  restDayNDHours: number;
  restDayNDOTHours: number;
  legalHolHours: number;
  legalHolOTHours: number;
  legalHolNightDiffHours: number;
  legalHolNightDiffOTHours: number;
  specialHolHours: number;
  specialHolOTHours: number;
  specialHolNightDiffHours: number;
  specialHolNightDiffOTHours: number;
  restLegalDayHours: number;
  restLegalDayOTHours: number;
  restLegalDayNDHours: number;
  restLegalDayNDOTHours: number;
  restSpecialDayHours: number;
  restSpecialDayOTHours: number;
  restSpecialDayNDHours: number;
  restSpecialDayNDOTHours: number;
}

export interface PayrollRunResponse {
  data: PayrollRunResult[];
  total: number;
}
