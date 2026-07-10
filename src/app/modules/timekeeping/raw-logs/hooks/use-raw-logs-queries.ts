import { useQuery } from "@tanstack/react-query";
import { rawLogsApi } from "../services/raw-logs.api";
import type { RawLogsFilterRequest } from "../models/api/response/raw-attendance-log.model";

const QUERY_KEY = ["raw-logs"];

interface QueryOptions {
  enabled?: boolean;
  generateKey?: number;
}

export function useRawAttendanceLogs(
  filters: RawLogsFilterRequest = {},
  options: QueryOptions = {},
) {
  return useQuery({
    queryKey: [
      ...QUERY_KEY,
      "raw-attendance",
      filters,
      options.generateKey ?? 0,
    ],
    queryFn: () => rawLogsApi.getRawAttendanceLogs(filters),
    enabled: options.enabled ?? true,
  });
}

export function useRawColumnarLogs(
  filters: RawLogsFilterRequest = {},
  options: QueryOptions = {},
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "raw-columnar", filters, options.generateKey ?? 0],
    queryFn: () => rawLogsApi.getRawColumnarLogs(filters),
    enabled: options.enabled ?? true,
  });
}

export function useCleanRowLogs(
  filters: RawLogsFilterRequest = {},
  options: QueryOptions = {},
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "clean-row", filters, options.generateKey ?? 0],
    queryFn: () => rawLogsApi.getCleanRowLogs(filters),
    enabled: options.enabled ?? true,
  });
}

export function useCleanColumnarLogs(
  filters: RawLogsFilterRequest = {},
  options: QueryOptions = {},
) {
  return useQuery({
    queryKey: [
      ...QUERY_KEY,
      "clean-columnar",
      filters,
      options.generateKey ?? 0,
    ],
    queryFn: () => rawLogsApi.getCleanColumnarLogs(filters),
    enabled: options.enabled ?? true,
  });
}
