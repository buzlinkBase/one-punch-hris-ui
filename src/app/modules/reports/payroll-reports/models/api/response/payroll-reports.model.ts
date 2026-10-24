export interface ReportEnvelope<T> {
  data: T[];
  total: number;
}

// Shared shape for the SSS / PhilHealth / Pag-IBIG / BIR Withholding Tax remittance
// reports — fields not applicable to a given ledger (e.g. WTax has no employer share)
// come back as 0 from the backend.
export interface ContributionRemittanceResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  govIdNumber: string;
  payrollFrom: string;
  payrollTo: string;
  payrollDate: string;
  employeeShare: number;
  employerShare: number;
  totalContribution: number;
}

export interface BankDisbursementResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  modeOfPayment: "Cash" | "ATM";
  bankName: string;
  bankNo: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  netPay: number;
}

export interface DeductionLedgerResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  deductionId: string;
  deductionTypeName: string;
  deductionName: string;
  totalPrincipal: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  currentBalance: number;
}

// One row per employee — Cash Bond is a flat, recurring deduction sourced straight from
// Employee.CashBond (see backend CashBondDeductionPolicy), not an amortized loan, so there's no
// target/remaining/approval concept — just the current per-run rate and how much has actually
// been collected across posted payroll runs. See PayrollReportService.GetCashBondReportAsync.
export interface CashBondReportResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  cashBondRate: number;
  /** Net of manual entries, e.g. the opening balance from before this system. */
  adjustments: number;
  collectedFromPayroll: number;
  /** Paid back through Last Pay, already taken off totalCollected. */
  refunded: number;
  /** adjustments + collectedFromPayroll - refunded */
  totalCollected: number;
  payrollRunsCount: number;
}

// One entry of an employee's cash bond rate history -- see hrms-api's CashBondRateChange. A
// history only: it never moves the collected total.
export interface CashBondRateChangeResponse {
  id: string;
  changedAt: string;
  oldRate: number;
  newRate: number;
  reason: string;
}

// Cash Bond Tracking "Edit rate" -- see hrms-api's CashBondController.ChangeRate. The new rate
// applies from the next payroll run.
export interface ChangeCashBondRateRequest {
  employeeId: string;
  newRate: number;
  reason: string;
}

// Cash Bond Tracking "Add entry" / "Adjust" -- see hrms-api's CashBondController.Adjust.
export interface AdjustCashBondRequest {
  employeeId: string;
  amount: number;
  isAddition: boolean;
  particulars: string;
  /** YYYY-MM-DD; counts toward the total for any "as of" date on or after it. */
  entryDate?: string;
}

// OneTime, employer-advanced government leave payouts awaiting/undergoing SSS-style
// reimbursement — see hrms-api's ReimbursementListModel/GetReimbursementListAsync. Direct
// Deposit payouts (government pays the employee, not this employer) never appear here — there
// is nothing for the employer to be reimbursed for.
export interface ReimbursementListResponse {
  leaveApplicationId: string;
  employeeId: string;
  employeeNo: string;
  fullName: string;
  leaveDescription: string;
  leaveDateFrom: string;
  leaveDateTo: string;
  releasePayrollDate: string | null;
  governmentAmount: number;
  status: "NotFiled" | "Filed" | "Reimbursed";
  filedDate: string | null;
  receivedDate: string | null;
  referenceNo: string | null;
}

export type CostSummaryGroupBy = "department" | "client" | "branch";

export interface CostSummaryResponse {
  groupId: string | null;
  groupName: string;
  employeeCount: number;
  totalBasicPay: number;
  totalGrossIncome: number;
  totalDeductions: number;
  totalNetPay: number;
  employerContributionsCost: number;
}

export interface AdjustLeaveCreditsRequest {
  employeeId: string;
  leaveId: string;
  year: number;
  newBalance: number;
  particulars: string;
}

export interface AdjustLeaveCreditsResponse {
  id: string;
  balance: number;
  granted: number;
  used: number;
}

export interface LeaveCreditsBalanceResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  leaveId: string;
  leaveCode: string;
  leaveDescription: string;
  periodYear: number;
  granted: number;
  used: number;
  balance: number;
  reserved: number;
  availableToFile: number;
}

// One movement in an employee's ledger details (Cash Bond, Retirement, Uniform Allowance,
// Leave), oldest first — see hrms-api's LedgerEntryModel.
export interface LedgerEntryResponse {
  entryDate: string;
  entryType: string;
  /** Signed: + adds to the balance, − deducts from it. */
  amount: number;
  /** Balance after this entry. */
  balance: number;
  remarks: string;
  /** Set when the entry came from a payroll run. */
  payrollId: string | null;
}

// Retirement / Uniform Allowance ledger main list: one row per employee as of a date.
export interface FundLedgerSummaryResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  totalAdded: number;
  /** Positive magnitude of every − entry. */
  totalDeducted: number;
  balance: number;
  entryCount: number;
  lastEntryDate: string | null;
  /** Uniform Allowance only: when the employee separated, if they have. */
  separatedOn?: string | null;
}

export interface AdjustRetirementRequest {
  employeeId: string;
  amount: number;
  isAddition: boolean;
  particulars: string;
}

export interface AdjustUniformAllowanceRequest {
  employeeId: string;
  amount: number;
  isAddition: boolean;
  particulars: string;
}

export interface UniformAllowanceReleaseItem {
  employeeId: string;
  amount: number;
}

export interface ReleaseUniformAllowanceRequest {
  releases: UniformAllowanceReleaseItem[];
  periodDate: string;
  particulars: string;
}

export interface ReleaseUniformAllowanceResponse {
  clampedEmployeeIds: string[];
}

export interface UniformAllowanceBalanceResponse {
  employeeId: string;
  balance: number;
}

export interface YtdPayrollSummaryResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  year: number;
  totalBasicPay: number;
  totalOvertimePay: number;
  totalHolidayPay: number;
  totalAllowances: number;
  totalOtherIncome: number;
  totalGrossIncome: number;
  totalSSS: number;
  totalPhilHealth: number;
  totalPagIbig: number;
  totalWithholdingTax: number;
  totalOtherDeductions: number;
  totalDeductions: number;
  totalNetPay: number;
}

export interface ThirteenthMonthResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  year: number;
  totalBasicPayForYear: number;
  thirteenthMonthPay: number;
  // Sum of Special Bonus-classified income paid this year — combined with thirteenthMonthPay
  // against the exemption ceiling per Payroll Settings' "13th Month Pay & Special Bonuses"
  // rule.
  totalSpecialBonusesForYear: number;
  // Released/unreleased tracker: no payout row yet / generated but not posted / released.
  status: "NotGenerated" | "Draft" | "Posted";
  // Only set once a 13th month payout row exists (status !== "NotGenerated").
  netPay: number | null;
  // The generated Payroll row's own id — needed to print its payslip. Null when
  // status === "NotGenerated".
  payrollId: string | null;
  // Setup > Payslip/13th Month/Last Pay > Received by Employee — mirrors the underlying
  // Payroll row's acknowledgedAt. Null when status === "NotGenerated" or not yet acknowledged.
  acknowledgedAt: string | null;
}

// BIR Form 1601-C's actual return figures for one posting period, matching the physical
// form's own Line 15/16A/16B/16C/17/18/19 layout — company-wide totals, summed from
// MonthlyRemittanceReturnEmployeeResponse rows. Not filed as a raw file upload (BIR requires
// eBIRForms/eFPS); this exists so the preparer has the exact numbers to transcribe.
export interface MonthlyRemittanceReturnResponse {
  periodFrom: string;
  periodTo: string;
  amendedReturn: boolean;
  employeeCount: number;
  line15_TotalCompensation: number;
  line16A_StatutoryMinimumWage: number;
  line16B_MWEPremiumPay: number;
  line16C_OtherNonTaxable: number;
  line17_TotalNonTaxable: number;
  line18_TaxableCompensation: number;
  line19_TaxWithheld: number;
  hasUnwithheldTaxWarning: boolean;
  // Employees whose Minimum-Wage-Earner status couldn't be determined this period (no Branch,
  // no Branch Region, or no Minimum Wage Rate for that region) — defaulted to non-MWE (KR010)
  // rather than failing the report. Review their Setup > Branch/Minimum Wage Rate data.
  unclassifiedEmployeeCount: number;
}

// One row per employee for the period — backs the report's drill-down (click a line, see the
// employee rows behind it).
export interface MonthlyRemittanceReturnEmployeeResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  isMinimumWageEarner: boolean;
  atcCode: string;
  grossCompensation: number;
  statutoryMinimumWage: number;
  mwePremiumPay: number;
  otherNonTaxable: number;
  taxableCompensation: number;
  taxWithheld: number;
  isUnclassified: boolean;
}

// One row per employee per year — BIR Alphalist entry / also the source for a 2316.
export interface AlphalistEntryResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  tin: string;
  year: number;
  grossCompensation: number;
  nonTaxableCompensation: number;
  taxableCompensation: number;
  thirteenthMonthPay: number;
  totalSSS: number;
  totalPhilHealth: number;
  totalPagIbig: number;
  totalTaxWithheld: number;
}

export interface Bir2316Response {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  tin: string;
  rdoCode: string;
  address: string;
  civilStatus: string;
  year: number;
  grossCompensation: number;
  nonTaxableCompensation: number;
  taxableCompensation: number;
  thirteenthMonthPay: number;
  totalSSS: number;
  totalPhilHealth: number;
  totalPagIbig: number;
  totalTaxWithheld: number;
}
