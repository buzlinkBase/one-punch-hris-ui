export interface CutoffModel {
  day: number;
  isEndOfMonth: boolean;
  label: string;
}

export type PayrollFrequency = "DAILY" | "WEEKLY" | "SEMI_MONTHLY" | "MONTHLY";

export type StatutoryDeductionSchedule =
  "PerPayroll" | "FirstHalfMonth" | "SecondHalfMonth";

export interface CreatePayrollGroup {
  code: string;
  name: string;
  payrollFrequency: PayrollFrequency;
  statutoryDeductionSchedule: StatutoryDeductionSchedule;
  cutoffDays?: CutoffModel[];
  status: string;
}
