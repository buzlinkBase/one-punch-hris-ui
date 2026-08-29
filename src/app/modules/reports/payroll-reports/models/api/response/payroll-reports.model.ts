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

export interface LoanLedgerResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  deductionId: string;
  loanTypeName: string;
  loanName: string;
  totalPrincipal: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  currentBalance: number;
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
}
