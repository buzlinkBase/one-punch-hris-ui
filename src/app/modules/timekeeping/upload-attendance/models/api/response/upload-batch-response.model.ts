// One attendance file upload (GET attendance/upload-batches).
export interface UploadBatchResponse {
  batchCode: string;
  // UTC; null when every log of the upload was removed one by one (only saved originals remain).
  uploadedAt: string | null;
  remarks: string;
  deviceName: string;
  logCount: number;
  employeeCount: number;
  firstLog: string | null;
  lastLog: string | null;
  // Logs of this upload a user edited or removed (saved originals).
  changedCount: number;
  // Saved DTR batches covering this upload's logs; while any is listed the upload can't be deleted.
  savedDtrBatches: string[];
}
