export interface PayrollRunResult {
  // Only populated when this row came from GET /payrolls (Payroll Summary — a persisted
  // record); Calculate/Generate preview responses have no saved Payroll.Id yet.
  id?: string;
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
