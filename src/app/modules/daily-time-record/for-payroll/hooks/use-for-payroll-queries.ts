import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { forPayrollApi } from "../services/for-payroll.api";
import type { PayrollRunRequest } from "../models/api/request/payroll-run-request.model";
import type { GenerateThirteenthMonthRequest } from "../models/api/request/generate-thirteenth-month-request.model";
import type { GenerateLastPayRequest } from "../models/api/request/generate-last-pay-request.model";
import type { TaxAnnualizationRunRequest } from "../models/api/request/tax-annualization-run-request.model";
import { invalidateLeaveBalances } from "@/shared/utils/invalidate-leave-balances";

const BATCH_KEY = ["dtr-batches"];
const PAYROLL_BATCHES_KEY = ["payroll-batches"];
// Which employees a cutoff can pay -- changes whenever DTR days are approved/unposted or a payroll
// run pays/releases them, so every such mutation below invalidates it.
const READINESS_KEY = ["payroll-readiness"];

/**
 * Everything that reads saved payroll results: the run lists, readiness, the employee portal's
 * payslips and the payroll reports. Every mutation that creates, approves or removes a run calls
 * this -- without it, other open screens kept showing the old figures for up to 5 minutes.
 */
function invalidatePayrollResults(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["payrolls"] });
  queryClient.invalidateQueries({ queryKey: PAYROLL_BATCHES_KEY });
  queryClient.invalidateQueries({ queryKey: READINESS_KEY });
  queryClient.invalidateQueries({ queryKey: ["me", "payrolls"] });
  queryClient.invalidateQueries({ queryKey: ["payroll-reports"] });
}

export function usePayrollReadiness(
  from?: string,
  to?: string,
  clientIds: string[] = [],
) {
  return useQuery({
    queryKey: [...READINESS_KEY, from, to, clientIds],
    queryFn: () =>
      forPayrollApi.getReadiness({
        from: from!,
        to: to!,
        clientIds: clientIds.length ? clientIds : undefined,
      }),
    enabled: !!from && !!to,
    // DTR approvals happen on other screens (and by other people) without touching this key,
    // so always refetch on mount/focus rather than trusting the 5-minute default.
    staleTime: 0,
  });
}

// Which saved run carries each employee's deductions for a cutoff. Runs are saved and deleted on
// other tabs, so it always refetches when the tab opens (staleTime 0) rather than being invalidated.
const CUTOFF_TRACKER_KEY = ["payroll-cutoff-tracker"];

export function useCutoffTracker(
  from?: string,
  to?: string,
  payrollGroupId?: string | null,
) {
  return useQuery({
    queryKey: [...CUTOFF_TRACKER_KEY, from, to, payrollGroupId ?? null],
    queryFn: () =>
      forPayrollApi.getCutoffTracker({
        from: from!,
        to: to!,
        payrollGroupId: payrollGroupId ?? undefined,
      }),
    enabled: !!from && !!to,
    staleTime: 0,
  });
}

// One employee's runs for a cutoff, fetched only while their statement is open.
export function useCutoffStatement(
  employeeId?: string,
  from?: string,
  to?: string,
) {
  return useQuery({
    queryKey: ["payroll-cutoff-statement", employeeId, from, to],
    queryFn: () =>
      forPayrollApi.getCutoffStatement({
        employeeId: employeeId!,
        from: from!,
        to: to!,
      }),
    enabled: !!employeeId && !!from && !!to,
    staleTime: 0,
  });
}

export function usePostDtrBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchCode: string) => forPayrollApi.postBatch(batchCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BATCH_KEY });
      queryClient.invalidateQueries({ queryKey: READINESS_KEY });
      invalidateLeaveBalances(queryClient);
    },
  });
}

export function useUnpostDtrBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchCode: string) => forPayrollApi.unpostBatch(batchCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BATCH_KEY });
      queryClient.invalidateQueries({ queryKey: READINESS_KEY });
      invalidateLeaveBalances(queryClient);
    },
  });
}

export function useCalculatePayroll() {
  return useMutation({
    mutationFn: (payload: PayrollRunRequest) =>
      forPayrollApi.calculate(payload),
  });
}

export function useGeneratePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PayrollRunRequest) => forPayrollApi.generate(payload),
    onSuccess: () => invalidatePayrollResults(queryClient),
  });
}

export function useGenerateThirteenthMonth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateThirteenthMonthRequest) =>
      forPayrollApi.generateThirteenthMonth(payload),
    onSuccess: () => invalidatePayrollResults(queryClient),
  });
}

export function useGenerateLastPay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateLastPayRequest) =>
      forPayrollApi.generateLastPay(payload),
    onSuccess: () => {
      invalidatePayrollResults(queryClient);
      // Last pay converts unused leave and refunds the cash bond.
      invalidateLeaveBalances(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["last-pay-cash-bond-status"],
      });
    },
  });
}

export function usePreviewYearEndAdjustment() {
  return useMutation({
    mutationFn: (payload: TaxAnnualizationRunRequest) =>
      forPayrollApi.previewYearEndAdjustment(payload),
  });
}

export function useGenerateYearEndAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaxAnnualizationRunRequest) =>
      forPayrollApi.generateYearEndAdjustment(payload),
    onSuccess: () => invalidatePayrollResults(queryClient),
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
  payrollBatchId?: string;
}) {
  return useQuery({
    queryKey: ["payrolls", params],
    queryFn: () => forPayrollApi.getPayrolls(params),
    enabled: !!params.payrollBatchId || (!!params.from && !!params.to),
  });
}

export function useApproveBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, note }: { batchId: string; note?: string }) =>
      forPayrollApi.approveBatch(batchId, note),
    // onSettled (not onSuccess-only): a failed approve can still have partially reached the
    // server (e.g. the response never made it back), so refetch either way to reflect whatever
    // actually got committed rather than leaving stale For Approval/Approved state on screen.
    onSettled: (_data, _error, { batchId }) => {
      invalidatePayrollResults(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "PayrollPosting", batchId],
      });
    },
  });
}

export function useDeclineBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, note }: { batchId: string; note?: string }) =>
      forPayrollApi.declineBatch(batchId, note),
    onSettled: (_data, _error, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({ queryKey: PAYROLL_BATCHES_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "PayrollPosting", batchId],
      });
    },
  });
}

export function useDeletePayrollBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => forPayrollApi.deletePayrollBatch(batchId),
    onSuccess: () => {
      invalidatePayrollResults(queryClient);
      // Deleting a payroll run unposts its DTRs, which gives their leave days back.
      invalidateLeaveBalances(queryClient);
    },
  });
}

// Batch-list projection for the Saved Payroll Runs tab -- independent of usePayrolls' own
// date-scoped report query.
export function usePayrollBatches(from?: string, to?: string) {
  return useQuery({
    queryKey: [...PAYROLL_BATCHES_KEY, from, to],
    queryFn: () => forPayrollApi.getPayrollBatches(from, to),
  });
}

export function useRequestPayrollBatchDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) =>
      forPayrollApi.requestBatchDeletion(batchId),
    onSettled: (_data, _error, batchId) => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_BATCHES_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "PayrollPostingDeletion", batchId],
      });
    },
  });
}

export function useApprovePayrollBatchDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, note }: { batchId: string; note?: string }) =>
      forPayrollApi.approveBatchDeletion(batchId, note),
    onSettled: (_data, _error, { batchId }) => {
      invalidatePayrollResults(queryClient);
      invalidateLeaveBalances(queryClient);
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "PayrollPostingDeletion", batchId],
      });
    },
  });
}

export function useDeclinePayrollBatchDeletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, note }: { batchId: string; note?: string }) =>
      forPayrollApi.declineBatchDeletion(batchId, note),
    onSettled: (_data, _error, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_BATCHES_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "PayrollPostingDeletion", batchId],
      });
    },
  });
}
