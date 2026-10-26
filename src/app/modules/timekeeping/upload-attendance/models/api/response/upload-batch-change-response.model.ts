// A log of an upload a user edited or removed, with its saved original
// (GET attendance/upload-batch/{batch}/changes).
export interface UploadBatchChangeResponse {
  id: string;
  action: "EDITED" | "DELETED";
  employeeId: string | null;
  employeeName: string;
  bioId: number | null;
  // The punch as the file had it.
  originalDateTime: string;
  // The punch as it stands now; null once removed.
  currentDateTime: string | null;
  reason: string;
  changedBy: string;
  // UTC.
  changedAt: string;
}
