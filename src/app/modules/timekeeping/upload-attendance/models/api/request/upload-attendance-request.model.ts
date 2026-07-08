export interface UploadAttendanceRequest {
  file: File;
  branchId?: string | null;
  operationAreaId?: string | null;
  clientId?: string | null;
}
