import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dtrDetailApi } from "../services/dtr-detail.api";
import type { DtrDetailFilter } from "../models/api/request/dtr-detail-filter.model";
import type { DtrDetailResponse } from "../models/api/response/dtr-detail-response.model";
import type { BatchesModel } from "../../summary/models/api/response/batches.model";
import { invalidateLeaveBalances } from "@/shared/utils/invalidate-leave-balances";

const QUERY_KEY = ["daily-time-record", "detail"];
const BATCH_CODES_KEY = ["daily-time-record", "detail", "batch-codes"];
const COVERAGE_KEY = ["dtr-coverage"];
// The Payroll Run screen's readiness list -- it reads the same DTR days, so anything that saves,
// approves or deletes DTR makes it stale too (see use-for-payroll-queries.ts).
const PAYROLL_READINESS_KEY = ["payroll-readiness"];

const invalidateCoverage = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: COVERAGE_KEY });
  queryClient.invalidateQueries({ queryKey: PAYROLL_READINESS_KEY });
};

export function useDtrCoverage(from?: string, to?: string) {
  return useQuery({
    queryKey: [...COVERAGE_KEY, from, to],
    queryFn: () => dtrDetailApi.getCoverage({ from: from!, to: to! }),
    enabled: !!from && !!to,
    // Saves and approvals by other people don't touch this key, so always refetch on mount/focus.
    staleTime: 0,
  });
}

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (records: DtrDetailResponse[]) => dtrDetailApi.save(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BATCH_CODES_KEY });
      invalidateCoverage(queryClient);
    },
  });
}

export function useDeleteDtrBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchCode: string) => dtrDetailApi.deleteByBatch(batchCode),
    onSettled: () => {
      invalidateLeaveBalances(queryClient);
      invalidateCoverage(queryClient);
    },
  });
}

export function useDtrDetailBatchCodes(from?: string, to?: string) {
  return useQuery<BatchesModel[]>({
    queryKey: [...BATCH_CODES_KEY, from, to],
    queryFn: () => dtrDetailApi.getBatchCodes(from, to),
    staleTime: 30_000,
  });
}

export function useApproveDtrBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, note }: { batchId: string; note?: string }) =>
      dtrDetailApi.approveBatch(batchId, note),
    onSettled: (_data, _error, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: BATCH_CODES_KEY });
      invalidateCoverage(queryClient);
      invalidateLeaveBalances(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "Dtr", batchId],
      });
    },
  });
}

export function useDeclineDtrBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, note }: { batchId: string; note?: string }) =>
      dtrDetailApi.declineBatch(batchId, note),
    onSettled: (_data, _error, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: BATCH_CODES_KEY });
      invalidateCoverage(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "Dtr", batchId],
      });
    },
  });
}

export function useRequestDtrBatchDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => dtrDetailApi.requestDeletion(batchId),
    onSettled: (_data, _error, batchId) => {
      queryClient.invalidateQueries({ queryKey: BATCH_CODES_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "DtrDeletion", batchId],
      });
    },
  });
}

export function useApproveDtrBatchDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, note }: { batchId: string; note?: string }) =>
      dtrDetailApi.approveDeletion(batchId, note),
    onSettled: (_data, _error, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: BATCH_CODES_KEY });
      invalidateCoverage(queryClient);
      invalidateLeaveBalances(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "DtrDeletion", batchId],
      });
    },
  });
}

export function useDeclineDtrBatchDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, note }: { batchId: string; note?: string }) =>
      dtrDetailApi.declineDeletion(batchId, note),
    onSettled: (_data, _error, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: BATCH_CODES_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "DtrDeletion", batchId],
      });
    },
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
