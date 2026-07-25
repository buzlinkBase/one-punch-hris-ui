import { useMutation, useQuery } from "@tanstack/react-query";
import { dtrDetailApi } from "../services/dtr-detail.api";
import type { DtrDetailFilter } from "../models/api/request/dtr-detail-filter.model";
import type { DtrDetailResponse } from "../models/api/response/dtr-detail-response.model";
import type { BatchesModel } from "../../summary/models/api/response/batches.model";

const QUERY_KEY = ["daily-time-record", "detail"];

export function useDtrDetailRecords(
  filter: DtrDetailFilter = {},
  options: { enabled?: boolean; generateKey?: number } = {},
) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter, options.generateKey ?? 0],
    queryFn: () => dtrDetailApi.getAll(filter),
    enabled: options.enabled ?? true,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useSaveDtrDetail() {
  return useMutation({
    mutationFn: (records: DtrDetailResponse[]) => dtrDetailApi.save(records),
  });
}

export function useDeleteDtrBatch() {
  return useMutation({
    mutationFn: (batchCode: string) => dtrDetailApi.deleteByBatch(batchCode),
  });
}

export function useDtrDetailBatchCodes() {
  return useQuery<BatchesModel[]>({
    queryKey: ["daily-time-record", "detail", "batch-codes"],
    queryFn: () => dtrDetailApi.getBatchCodes(),
    staleTime: 30_000,
  });
}

export function useDtrDetailMaster(
  batchCode: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["daily-time-record", "detail", "master", batchCode],
    queryFn: () => dtrDetailApi.loadDetail(batchCode),
    enabled: (options.enabled ?? true) && batchCode.length > 0,
    staleTime: 0,
    gcTime: 0,
  });
}
