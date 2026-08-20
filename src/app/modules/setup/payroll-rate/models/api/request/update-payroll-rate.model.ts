import type { CreatePayrollRate } from "./create-payroll-rate.model";

export interface UpdatePayrollRate extends CreatePayrollRate {
  id: string;
}
