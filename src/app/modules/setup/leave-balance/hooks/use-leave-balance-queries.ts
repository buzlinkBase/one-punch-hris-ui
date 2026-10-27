import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveBalanceApi } from "../services/leave-balance.api";
import type { AdjustLeaveBalance } from "../models/api/request/adjust-leave-balance.model";
import { invalidateLeaveBalances } from "@/shared/utils/invalidate-leave-balances";

const QUERY_KEY = ["leave-balance"];

export function useLeaveBalance(
  employeeId: string | undefined,
  leaveId: string | undefined,
  year: number | undefined,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, employeeId, leaveId, year],
    queryFn: () => leaveBalanceApi.getBalance(employeeId!, leaveId!, year!),
    enabled: !!employeeId && !!leaveId && !!year,
  });
}

export function usePreviewDtrReconcile() {
  return useMutation({
    mutationFn: (year: number) => leaveBalanceApi.reconcileWithDtr(year, true),
  });
}

export function useApplyDtrReconcile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (year: number) => leaveBalanceApi.reconcileWithDtr(year, false),
    onSuccess: () => invalidateLeaveBalances(queryClient),
  });
}

export function useAdjustLeaveBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdjustLeaveBalance) => leaveBalanceApi.adjust(data),
    // Every view of the credits, not just this balance -- the portal's leave credits and the
    // leave ledger report show the same figures.
    onSuccess: () => invalidateLeaveBalances(queryClient),
  });
}
