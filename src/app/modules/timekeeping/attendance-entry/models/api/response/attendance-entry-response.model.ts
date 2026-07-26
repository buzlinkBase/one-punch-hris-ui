export interface AttendanceEntryResponse {
  id: string;
  employeeId: string | null;
  employeeName: string | null;
  timeLog: string;
  batchCode: string | null;
  logSource: string;
  branch: string | null;
  client: string | null;
  area: string | null;
}
