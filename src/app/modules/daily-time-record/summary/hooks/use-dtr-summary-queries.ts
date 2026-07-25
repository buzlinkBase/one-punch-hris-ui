import { useQuery } from "@tanstack/react-query";
import { dtrSummaryApi } from "../services/dtr-summary.api";
import type { BatchesModel } from "../models/api/response/batches.model";

const QUERY_KEY = ["daily-time-record", "summary"];

export function useDtrBatchCodes() {
  return useQuery<BatchesModel[]>({
    queryKey: [...QUERY_KEY, "batch-codes"],
    queryFn: () => dtrSummaryApi.getBatchCodes(),
    staleTime: 30_000,
  });
}

export function useDtrByBatchCode(
  batchCode: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "codes", batchCode],
    queryFn: () => dtrSummaryApi.getByBatchCode(batchCode),
    enabled: (options.enabled ?? true) && batchCode.length > 0,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useDtrSummaryByBatch(
  batchCode: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [...QUERY_KEY, "load-summary", batchCode],
    queryFn: () => dtrSummaryApi.getByBatchSummary(batchCode),
    enabled: (options.enabled ?? true) && batchCode.length > 0,
    staleTime: 0,
    gcTime: 0,
  });
}
