// "My Cash Bond" — Cash Bond is a flat, recurring payroll deduction sourced straight from
// Employee.CashBond (see backend CashBondDeductionPolicy), not a loan the employee owes. Shows
// the current per-run rate plus every payroll run that's actually collected it so far. See
// PayrollReportService.GetMyCashBondAsync / MeController.GetMyCashBond.
export interface MyCashBondRun {
  payrollId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  amount: number;
}

/** Entered by HR, e.g. cash bond already deducted before this system. Signed amount. */
export interface MyCashBondAdjustment {
  entryDate: string;
  amount: number;
  particulars: string;
}

export interface MyCashBondModel {
  cashBondRate: number;
  /** Payroll runs plus HR entries. */
  totalCollected: number;
  runs: MyCashBondRun[];
  adjustments: MyCashBondAdjustment[];
}
