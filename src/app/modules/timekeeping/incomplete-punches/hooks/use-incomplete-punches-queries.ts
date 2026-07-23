import { useQuery } from "@tanstack/react-query";
import { incompletePunchesApi } from "../services/incomplete-punches.api";
import type { IncompletePunchesFilterRequest } from "../models/api/response/incomplete-punch.model";
import type { RawLogsFilterRequest } from "@/app/modules/timekeeping/raw-logs/models/api/response/raw-attendance-log.model";

interface QueryOptions {
  enabled?: boolean;
  generateKey?: number;
}

const QUERY_KEY = ["incomplete-punches"];

export function useIncompletePunches(filters?: IncompletePunchesFilterRequest) {
  return useQuery({
    queryKey: [...QUERY_KEY, "list", filters],
    queryFn: () => incompletePunchesApi.getAll(filters),
  });
}

export function useIncompletePunch(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "detail", id],
    queryFn: () => incompletePunchesApi.getById(id!),
    enabled: !!id,
  });
}

export function useIncompleteColumnar(
  filters: RawLogsFilterRequest = {},
  options: QueryOptions = {},
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "columnar", filters, options.generateKey ?? 0],
    queryFn: () => incompletePunchesApi.getIncompleteColumnar(filters),
    enabled: options.enabled ?? true,
  });
}
