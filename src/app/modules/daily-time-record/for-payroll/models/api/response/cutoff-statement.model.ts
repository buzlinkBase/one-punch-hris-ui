// Cutoff Statement -- see hrms-api's CutoffStatementModel / PayrollsController.CutoffStatement.
// Everything one employee was paid in a cutoff across all their per-client runs.
export interface CutoffStatementRun {
  payrollBatchId: string;
  clientId?: string | null;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate?: string | null;
  remarks?: string | null;
  isPosted: boolean;
  approvalStatus: "ForApproval" | "Approved" | "Declined" | "Cancelled";
  // false = earnings only; another run of the cutoff took the deductions.
  isDeductionCarrier: boolean;
  grossIncome: number;
  sssContribution: number;
  philHealthContribution: number;
  pagIbigContribution: number;
  withholdingTax: number;
  cashBondDeduction: number;
  totalLoans: number;
  // Deductions other than loans.
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
}

export interface CutoffStatementTotals {
  grossIncome: number;
  totalDeductions: number;
  netPay: number;
}

export interface CutoffStatement {
  employeeId: string;
  fullName?: string | null;
  from: string;
  to: string;
  runs: CutoffStatementRun[];
  totals: CutoffStatementTotals;
}
