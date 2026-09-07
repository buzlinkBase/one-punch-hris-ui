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
  // Why this log was manually created/edited — editRemarks (user-authored) wins, falling back
  // to logRemarks (auto-generated context, e.g. Pass Slip's "Pass Slip - {Purpose}") so those
  // rows show something meaningful too. Null for ordinary biometric punches.
  remarks: string | null;
}
