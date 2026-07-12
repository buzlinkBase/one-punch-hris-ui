export interface AttendanceEntryResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  timeLog: string;
  batchCode?: string | null;
}
