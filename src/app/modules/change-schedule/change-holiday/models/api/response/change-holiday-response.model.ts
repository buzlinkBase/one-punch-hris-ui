import type { ChangeHolidayTargetType } from "../request/create-change-holiday.model";

export interface ChangeHolidayResponse {
  id: string;
  targetType: ChangeHolidayTargetType;
  employeeId?: string;
  employeeIds?: string[];
  employeeName?: string;
  targetLabel: string;
  holidayId: string;
  holidayName: string;
  clientId: string;
  clientName: string;
  payrollGroupId?: string;
  fromDate: string;
  toDate: string;
}
