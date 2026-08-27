export interface PayrollRunResult {
  employeeId: string;
  fullName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  salaryType: "VARIABLE" | "FIXED";
  dailyRate: number;
  // Earnings
  basicPay: number;
  overtimeHour: number;
  overtimePay: number;
  nightDifferentialHour: number;
  nightDifferentialPay: number;
  nightDifferentialOTPay: number;
  holidayPay: number;
  restDayPay: number;
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
