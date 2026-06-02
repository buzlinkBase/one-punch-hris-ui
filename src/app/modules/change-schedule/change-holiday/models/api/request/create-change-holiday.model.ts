export type ChangeHolidayTargetType =
  | "employee"
  | "payroll-group"
  | "employee-group";

export interface CreateChangeHoliday {
  employeeIds: string[];
  holidayId: string;
  payrollDateFrom: string;
  payrollDateTo: string;
}
