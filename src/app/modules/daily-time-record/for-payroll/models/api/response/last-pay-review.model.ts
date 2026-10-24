// Review-step data for the Last Pay generation screen — every Salary Adjustment / Other
// Income row not yet consumed by any payroll run for the selected employees, plus any
// informational DTR attendance warnings. See PayrollsController's last-pay/* GET endpoints.

export interface AvailableSalaryAdjustment {
  id: string;
  adjustmentType: "Salary" | "Allowance" | "Deduction";
  employeeId: string;
  payrollDate: string;
  amount: number;
  remarks?: string;
}

export interface AvailableOtherIncome {
  id: string;
  employeeId: string;
  applicationId: string;
  incomeId: string;
  income?: { id: string; name: string };
  date: string;
  amount: number;
  isTaxable: boolean;
  notes: string;
}

export interface LastPayAttendanceWarning {
  employeeId: string;
  fullName: string;
  lastRegularPayPeriodEnd?: string | null;
  separationDate: string;
  unpaidAttendanceDayCount: number;
}

// See PayrollsController's last-pay/cash-bond-status GET. totalCollected is what the Last Pay
// run refunds (added to Net Pay, non-taxable) while "Include cash bond refund" is ticked; HR can
// untick it to withhold the bond pending clearance. Cash Bond is a flat, recurring deduction
// (see backend CashBondDeductionPolicy) — no target/remaining concept.
export interface LastPayCashBondStatus {
  employeeId: string;
  fullName: string;
  cashBondRate: number;
  totalCollected: number;
  payrollRunsCount: number;
}
