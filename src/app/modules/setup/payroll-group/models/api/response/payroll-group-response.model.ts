import type {
  CutoffModel,
  PayrollFrequency,
  StatutoryDeductionSchedule,
} from "../request/create-payroll-group.model";

export interface PayrollGroupResponse {
  id: string;
  code: string;
  name: string;
  payrollFrequency: PayrollFrequency;
  statutoryDeductionSchedule: StatutoryDeductionSchedule;
  cutoffDays?: CutoffModel[];
  status: string;
}
