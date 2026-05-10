export type ChangeHolidayTargetType =
  | "employee"
  | "payroll-group"
  | "employee-group";

export interface CreateChangeHoliday {
  targetType: ChangeHolidayTargetType;
  employeeId?: string;
  payrollGroupId?: string;
  employeeIds?: string[];
  holidayId: string;
  fromDate: string;
  toDate: string;
}
