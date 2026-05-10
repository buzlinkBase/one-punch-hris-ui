import type { ChangeHolidayTargetType } from "./create-change-holiday.model";

export interface ChangeHolidayFilter {
  targetType?: ChangeHolidayTargetType;
  payrollGroupId?: string;
  employeeId?: string;
  clientId?: string;
  fromPayrollDate?: string;
  toPayrollDate?: string;
}
