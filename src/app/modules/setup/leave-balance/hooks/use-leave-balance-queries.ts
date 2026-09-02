import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveBalanceApi } from "../services/leave-balance.api";
import type { AdjustLeaveBalance } from "../models/api/request/adjust-leave-balance.model";

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

export function useAdjustLeaveBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdjustLeaveBalance) => leaveBalanceApi.adjust(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...QUERY_KEY,
          variables.employeeId,
          variables.leaveId,
          variables.year,
        ],
      });
    },
  });
}
