export interface UpdateAttendanceEntry {
  id: string;
  workTime: string;
  // Required — why this log is being manually edited.
  remarks: string;
}
