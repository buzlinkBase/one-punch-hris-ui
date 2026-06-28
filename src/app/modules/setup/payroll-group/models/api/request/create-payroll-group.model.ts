export interface CutoffModel {
  day: number;
  isEndOfMonth: boolean;
  label: string;
}

export type PayrollFrequency = 'DAILY' | 'WEEKLY' | 'SEMI_MONTHLY' | 'MONTHLY';

export interface CreatePayrollGroup {
  code: string;
  name: string;
  payrollFrequency: PayrollFrequency;
  cutoffDays?: CutoffModel[];
  status: string;
}
