import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceEntryApi } from "../services/attendance-entry.api";
import type { AttendanceEntryFilter } from "../models/api/request/attendance-entry-filter.model";

const QUERY_KEY = ["timekeeping", "attendance-entry"];

export function useAttendanceEntryRecords(filter: AttendanceEntryFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => attendanceEntryApi.getAll(filter),
  });
}

export function useAttendanceEntryEmployees() {
  return useQuery({
    queryKey: [...QUERY_KEY, "employees"],
    queryFn: async () => attendanceEntryApi.getEmployees(),
  });
}

export function useDeleteAttendanceEntryLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => attendanceEntryApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
