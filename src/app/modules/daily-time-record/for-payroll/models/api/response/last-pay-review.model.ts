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
  isProrated: boolean;
  notes: string;
}

export interface LastPayAttendanceWarning {
  employeeId: string;
  fullName: string;
  lastRegularPayPeriodEnd?: string | null;
  separationDate: string;
  unpaidAttendanceDayCount: number;
}

// Informational only — see PayrollsController's last-pay/cash-bond-status GET. Never applied
// to Net Pay automatically; HR decides the refund manually as part of clearance.
export interface LastPayCashBondStatus {
  employeeId: string;
  fullName: string;
  targetAmount: number;
  totalCollected: number;
  remaining: number;
  approvalStatus: string;
}
