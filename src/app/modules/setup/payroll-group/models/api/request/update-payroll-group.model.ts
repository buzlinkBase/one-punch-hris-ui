import type { CreatePayrollGroup } from "./create-payroll-group.model";

export interface UpdatePayrollGroup extends CreatePayrollGroup {
  id: string;
}
