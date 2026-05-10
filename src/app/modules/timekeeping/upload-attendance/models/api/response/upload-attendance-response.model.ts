export interface UploadAttendanceResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  timeLog: string;
  source: "SYSTEM" | "UPLOADED";
}
