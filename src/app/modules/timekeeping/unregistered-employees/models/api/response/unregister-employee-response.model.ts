export interface UnregisteredAttendanceLog {
  id: string;
  bioId: number | null;
  employeeId: string | null;
  name: string | null;
  workDateTime: string;
  batch: string;
  logSource: string;
  branch: string | null;
  client: string | null;
  area: string | null;
}
