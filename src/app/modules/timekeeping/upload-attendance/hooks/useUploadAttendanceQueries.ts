import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadAttendanceApi } from "../services/upload-attendance.api";
import type { UploadAttendanceFilter } from "../models/api/request/upload-attendance-filter.model";

const QUERY_KEY = ["timekeeping", "upload-attendance"];

export function useUploadAttendanceRecords(
  filter: UploadAttendanceFilter = {},
) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => uploadAttendanceApi.getAll(filter),
  });
}

export function useUploadRawAttendanceLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAttendanceApi.uploadRawLog(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUploadAttendanceEmployees() {
  return useQuery({
    queryKey: [...QUERY_KEY, "employees"],
    queryFn: async () => uploadAttendanceApi.getEmployees(),
  });
}
