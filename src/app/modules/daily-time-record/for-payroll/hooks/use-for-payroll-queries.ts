import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { forPayrollApi } from "../services/for-payroll.api";
import type { PayrollRunRequest } from "../models/api/request/payroll-run-request.model";
import type { GenerateThirteenthMonthRequest } from "../models/api/request/generate-thirteenth-month-request.model";
import type { GenerateLastPayRequest } from "../models/api/request/generate-last-pay-request.model";
import type { TaxAnnualizationRunRequest } from "../models/api/request/tax-annualization-run-request.model";

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

export function useGenerateLastPay() {
  return useMutation({
    mutationFn: (payload: GenerateLastPayRequest) =>
      forPayrollApi.generateLastPay(payload),
  });
}

export function usePreviewYearEndAdjustment() {
  return useMutation({
    mutationFn: (payload: TaxAnnualizationRunRequest) =>
      forPayrollApi.previewYearEndAdjustment(payload),
  });
}

export function useGenerateYearEndAdjustment() {
  return useMutation({
    mutationFn: (payload: TaxAnnualizationRunRequest) =>
      forPayrollApi.generateYearEndAdjustment(payload),
  });
}

// Review-step data for the Last Pay generation screen — only meaningful once at least one
// separated employee is selected, so all three stay disabled until then.
export function useAvailableSalaryAdjustments(employeeIds: string[]) {
  return useQuery({
    queryKey: ["last-pay-available-salary-adjustments", employeeIds],
    queryFn: () => forPayrollApi.getAvailableSalaryAdjustments(employeeIds),
    enabled: employeeIds.length > 0,
  });
}

export function useAvailableOtherIncome(employeeIds: string[]) {
  return useQuery({
    queryKey: ["last-pay-available-other-income", employeeIds],
    queryFn: () => forPayrollApi.getAvailableOtherIncome(employeeIds),
    enabled: employeeIds.length > 0,
  });
}

export function useLastPayAttendanceWarnings(employeeIds: string[]) {
  return useQuery({
    queryKey: ["last-pay-attendance-warnings", employeeIds],
    queryFn: () => forPayrollApi.getLastPayAttendanceWarnings(employeeIds),
    enabled: employeeIds.length > 0,
  });
}

export function useLastPayCashBondStatus(employeeIds: string[]) {
  return useQuery({
    queryKey: ["last-pay-cash-bond-status", employeeIds],
    queryFn: () => forPayrollApi.getLastPayCashBondStatus(employeeIds),
    enabled: employeeIds.length > 0,
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
