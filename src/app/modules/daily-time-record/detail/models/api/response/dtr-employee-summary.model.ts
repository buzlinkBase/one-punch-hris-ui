// Mirrors backend DtrEmployeeSummaryModel (GET dailyrecords/dtr-summary): one employee's
// calculated DTR for the cutoff, without the day rows -- those load per employee when expanded.
export interface DtrEmployeeSummaryResponse {
  employeeId: string;
  fullName?: string | null;
  // Distinct calculated days ("yyyy-MM-dd"), ascending.
  workDates: string[];
  regularHours: number;
  otHours: number;
  ndHours: number;
  lateMinutes: number;
  utMinutes: number;
  absences: number;
  leaveHours: number;
  // Days with a time-in but no time-out, or the other way round.
  missingPunchDays: number;
}
