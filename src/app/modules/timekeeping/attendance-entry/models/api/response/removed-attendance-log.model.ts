// A removed uploaded/synced log whose original is kept, so it can be restored
// (GET attendance/dtr-view-removed-by-shift).
export interface RemovedAttendanceLog {
  id: string;
  workDateTime: string;
  logSource: string;
  batch: string;
  deviceName: string;
  reason: string;
  removedBy: string;
  // UTC.
  removedAt: string;
}
