export interface CreateAttendanceEntry {
  workTime: string;
  employeeId: string;
  // Required — why this punch is being manually entered instead of coming from a device.
  remarks: string;
}
