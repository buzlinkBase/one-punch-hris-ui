export interface UploadAttendanceRequest {
  file: File;
  branchId?: string | null;
  operationAreaId?: string | null;
  clientId?: string | null;
  departmentId?: string | null;
  // Required — why this file is being uploaded out-of-band (tagged onto every imported row's
  // LogRemarks for audit purposes, even though the punches themselves are device data).
  remarks: string;
}
