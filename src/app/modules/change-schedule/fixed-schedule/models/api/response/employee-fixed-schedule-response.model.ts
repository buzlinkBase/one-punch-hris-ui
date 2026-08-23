export type DayName =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface EmployeeFixedScheduleResponse {
  id: string;
  employeeId: string;
  dayName: DayName;
  timeShiftId: string;
  timeShiftName?: string;
  shiftType: string;
  startTime: string;
  endTime: string;
}
