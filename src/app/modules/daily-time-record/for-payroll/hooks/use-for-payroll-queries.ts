import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { forPayrollApi } from "../services/for-payroll.api";
import type { PayrollRunRequest } from "../models/api/request/payroll-run-request.model";
import type { GenerateThirteenthMonthRequest } from "../models/api/request/generate-thirteenth-month-request.model";

const BATCH_KEY = ["dtr-batches"];

export function useDtrBatches(from?: string, to?: string) {
  return useQuery({
    queryKey: [...BATCH_KEY, from, to],
    queryFn: () => forPayrollApi.getBatches(from, to),
  });
}

export function usePostDtrBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchCode: string) => forPayrollApi.postBatch(batchCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BATCH_KEY }),
  });
}

export function useUnpostDtrBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchCode: string) => forPayrollApi.unpostBatch(batchCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BATCH_KEY }),
  });
}

export function useCalculatePayroll() {
  return useMutation({
    mutationFn: (payload: PayrollRunRequest) =>
      forPayrollApi.calculate(payload),
  });
}

export function useGeneratePayroll() {
  return useMutation({
    mutationFn: (payload: PayrollRunRequest) => forPayrollApi.generate(payload),
  });
}

export function useGenerateThirteenthMonth() {
  return useMutation({
    mutationFn: (payload: GenerateThirteenthMonthRequest) =>
      forPayrollApi.generateThirteenthMonth(payload),
  });
}

export function usePayrolls(params: {
  from?: string;
  to?: string;
  employeeId?: string;
  clientId?: string;
  payrollGroupId?: string;
}) {
  return useQuery({
    queryKey: ["payrolls", params],
    queryFn: () =>
      forPayrollApi.getPayrolls({
        from: params.from!,
        to: params.to!,
        employeeId: params.employeeId,
        clientId: params.clientId,
        payrollGroupId: params.payrollGroupId,
      }),
    enabled: !!params.from && !!params.to,
  });
}

export function usePostPayrollBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => forPayrollApi.postPayrollBatch(batchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payrolls"] }),
  });
}

export function useDeletePayrollBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => forPayrollApi.deletePayrollBatch(batchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payrolls"] }),
  });
}
