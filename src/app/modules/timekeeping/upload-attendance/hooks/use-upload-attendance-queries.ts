import { useMutation } from "@tanstack/react-query";
import { uploadAttendanceApi } from "../services/upload-attendance.api";
import type { UploadAttendanceRequest } from "../models/api/request/upload-attendance-request.model";

export function useUploadAttendanceLog() {
  return useMutation({
    mutationFn: (data: UploadAttendanceRequest) =>
      uploadAttendanceApi.upload(data),
  });
}
