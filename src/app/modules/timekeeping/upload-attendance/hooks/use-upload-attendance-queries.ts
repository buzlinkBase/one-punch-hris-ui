import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadAttendanceApi } from "../services/upload-attendance.api";
import type { UploadAttendanceRequest } from "../models/api/request/upload-attendance-request.model";
import { QUERY_KEY as ATTENDANCE_ENTRY_QUERY_KEY } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";

const BATCHES_QUERY_KEY = ["timekeeping", "upload-attendance", "batches"];

export function useUploadAttendanceLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadAttendanceRequest) =>
      uploadAttendanceApi.upload(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEY });
    },
  });
}

export function useUploadBatches(
  filter: { fromDate?: string; toDate?: string },
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [...BATCHES_QUERY_KEY, filter],
    queryFn: () => uploadAttendanceApi.getBatches(filter),
    enabled: options.enabled ?? true,
  });
}

export function useDeleteUploadBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchCode: string) =>
      uploadAttendanceApi.deleteBatch(batchCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_ENTRY_QUERY_KEY });
    },
  });
}
