import { useQuery } from "@tanstack/react-query";
import { rawLogsApi } from "../services/raw-logs.api";
import type { RawLogsFilterRequest } from "../models/api/response/raw-attendance-log.model";

const QUERY_KEY = ["raw-logs"];

export function useRawLogs(filters?: RawLogsFilterRequest) {
  return useQuery({
    queryKey: [...QUERY_KEY, "all", filters],
    queryFn: () => rawLogsApi.getAll(filters),
  });
}

export function useRawAttendanceLogs(filters?: RawLogsFilterRequest) {
  return useQuery({
    queryKey: [...QUERY_KEY, "raw-attendance", filters],
    queryFn: () => rawLogsApi.getRawAttendanceLogs(filters),
  });
}

export function useRawColumnarLogs(filters?: RawLogsFilterRequest) {
  return useQuery({
    queryKey: [...QUERY_KEY, "raw-columnar", filters],
    queryFn: () => rawLogsApi.getRawColumnarLogs(filters),
  });
}

export function useCleanRowLogs(filters?: RawLogsFilterRequest) {
  return useQuery({
    queryKey: [...QUERY_KEY, "clean-row", filters],
    queryFn: () => rawLogsApi.getCleanRowLogs(filters),
  });
}

export function useCleanColumnarLogs(filters?: RawLogsFilterRequest) {
  return useQuery({
    queryKey: [...QUERY_KEY, "clean-columnar", filters],
    queryFn: () => rawLogsApi.getCleanColumnarLogs(filters),
  });
}
