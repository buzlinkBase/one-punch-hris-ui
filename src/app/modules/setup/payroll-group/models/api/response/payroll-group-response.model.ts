import type { CutoffModel, PayrollFrequency } from '../request/create-payroll-group.model';

export interface PayrollGroupResponse {
  id: string;
  code: string;
  name: string;
  payrollFrequency: PayrollFrequency;
  cutoffDays?: CutoffModel[];
  status: string;
}
