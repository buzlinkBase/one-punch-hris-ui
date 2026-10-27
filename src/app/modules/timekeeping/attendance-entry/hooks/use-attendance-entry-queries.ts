import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceEntryApi } from "../services/attendance-entry.api";
import type { AttendanceEntryFilter } from "../models/api/request/attendance-entry-filter.model";
import type { CreateAttendanceEntry } from "../models/api/request/create-attendance-entry.model";
import { RAW_LOGS_QUERY_KEY } from "@/app/modules/timekeeping/raw-logs/hooks/use-raw-logs-queries";
import type { UpdateAttendanceEntry } from "../models/api/request/update-attendance-entry.model";

export const QUERY_KEY = ["timekeeping", "attendance-entry"];

// A log edited or removed here also changes the Attendance Logs report, and the DTR computed
// from those logs (its detail/summary views and which days count as covered).
function invalidateLogViews(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: RAW_LOGS_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: ["daily-time-record"] });
  queryClient.invalidateQueries({ queryKey: ["dtr-coverage"] });
}

export function useShiftAttendanceLogs(
  filter: {
    employeeId: string;
    workDate: string;
    timeShiftId?: string | null;
    actualStart?: string | null;
    actualEnd?: string | null;
  },
  options: { enabled?: boolean; searchKey?: number } = {},
) {
  return useQuery({
    queryKey: [
      ...QUERY_KEY,
      "dtr-view-by-shift",
      filter,
      options.searchKey ?? 0,
    ],
    queryFn: () => attendanceEntryApi.getShiftAttendanceLogs(filter),
    enabled: options.enabled ?? true,
  });
}

// Removed uploaded/synced logs of the same shift, whose originals can be restored.
export function useRemovedShiftLogs(
  filter: Parameters<typeof attendanceEntryApi.getRemovedShiftLogs>[0],
  options: { enabled?: boolean; searchKey?: number } = {},
) {
  return useQuery({
    queryKey: [
      ...QUERY_KEY,
      "dtr-view-removed-by-shift",
      filter,
      options.searchKey ?? 0,
    ],
    queryFn: () => attendanceEntryApi.getRemovedShiftLogs(filter),
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
      invalidateLogViews(queryClient);
    },
  });
}

export function useUpdateAttendanceEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAttendanceEntry) =>
      attendanceEntryApi.update(payload),
    onSuccess: () => {
      invalidateLogViews(queryClient);
    },
  });
}

export function useDeleteAttendanceEntryLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => attendanceEntryApi.remove(id),
    onSuccess: () => {
      invalidateLogViews(queryClient);
    },
  });
}

// Removes one log of any source; reason is kept with a removed uploaded/synced log's original.
export function useRemoveAttendanceLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      attendanceEntryApi.remove(id, reason),
    onSuccess: () => {
      invalidateLogViews(queryClient);
    },
  });
}

export function useRestoreOriginalLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (originalLogId: string) =>
      attendanceEntryApi.restoreOriginal(originalLogId),
    onSuccess: () => {
      invalidateLogViews(queryClient);
    },
  });
}

export function useDeleteAttendanceBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchCode: string) =>
      attendanceEntryApi.deleteBatch(batchCode),
    onSuccess: () => {
      invalidateLogViews(queryClient);
    },
  });
}
