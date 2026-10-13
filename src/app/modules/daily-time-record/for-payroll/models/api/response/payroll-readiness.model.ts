// One employee's payroll readiness for a cutoff -- see hrms-api's PayrollReadinessEmployee /
// PayrollsController.Readiness. Day counts are DTR days inside the range: approved = posted and
// not yet paid (what a run pays today), pending = still awaiting DTR approval, paid = already in a
// payroll run (draft or approved).
export type PayrollReadinessStatus =
  "Ready" | "Partial" | "Pending" | "Paid" | "FixedSalaryAlreadyPaid";

export interface PayrollReadinessEmployee {
  employeeId: string;
  employeeNo?: string | null;
  fullName?: string | null;
  payrollGroupId?: string | null;
  clientId?: string | null;
  departmentId?: string | null;
  salaryType: "FIXED" | "VARIABLE";
  approvedDays: number;
  pendingDays: number;
  paidDays: number;
  pendingBatchCodes: string[];
  // Distinct work dates (YYYY-MM-DD) that already have a DTR row in the range, any status.
  savedDates?: string[];
  // Payroll-only (no DTR) employee: paid from the fixed rate, so the day counts stay 0.
  isPayrollOnly?: boolean;
  status: PayrollReadinessStatus;
}
