export type ScheduleSource =
  "Override" | "FixedSchedule" | "Permanent" | "OpenShift";

export interface RosterResponse {
  workDate: string;
  employeeId: string;
  employeeNo: string;
  fullName: string;
  department: string | null;
  shiftId: string | null;
  shiftName: string;
  scheduleSource: ScheduleSource;
  overrideId: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  isRestDay: boolean;
  /** Project site tagged on the Work Rotation override; null = the employee's own site. */
  areaId: string | null;
  areaName: string | null;
}
