import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceEntryApi } from "../services/attendance-entry.api";
import type { AttendanceEntryFilter } from "../models/api/request/attendance-entry-filter.model";
import type { CreateAttendanceEntry } from "../models/api/request/create-attendance-entry.model";
import type { UpdateAttendanceEntry } from "../models/api/request/update-attendance-entry.model";

const QUERY_KEY = ["timekeeping", "attendance-entry"];

export function useDtrViewAttendanceLogs(
  filter: AttendanceEntryFilter = {},
  options: { enabled?: boolean; searchKey?: number } = {},
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "dtr-view", filter, options.searchKey ?? 0],
    queryFn: () => attendanceEntryApi.getDtrViewLogs(filter),
    enabled: options.enabled ?? true,
  });
}

export function useAttendanceEntryRecords(
  filter: AttendanceEntryFilter = {},
  options: { enabled?: boolean; searchKey?: number } = {},
) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter, options.searchKey ?? 0],
    queryFn: () => attendanceEntryApi.getAll(filter),
    enabled: options.enabled ?? true,
  });
}

export function useEmployeeFilter(
  filter: Parameters<typeof attendanceEntryApi.filterEmployees>[0] = {},
  options: { enabled?: boolean; searchKey?: number } = {},
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "employee-filter", filter, options.searchKey ?? 0],
    queryFn: () => attendanceEntryApi.filterEmployees(filter),
    enabled: options.enabled ?? true,
  });
}

export function useCreateAttendanceEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries: CreateAttendanceEntry[]) =>
      attendanceEntryApi.create(entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateAttendanceEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAttendanceEntry) =>
      attendanceEntryApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
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

export function useDeleteAttendanceBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchCode: string) =>
      attendanceEntryApi.deleteBatch(batchCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
