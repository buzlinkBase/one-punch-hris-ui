import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payrollReportsApi } from "../services/payroll-reports.api";
import type { CostSummaryGroupBy } from "../models/api/response/payroll-reports.model";

export function useSssRemittance(from: string, to: string) {
  return useQuery({
    queryKey: ["payroll-reports", "sss-remittance", from, to],
    queryFn: () => payrollReportsApi.sssRemittance(from, to),
  });
}

export function usePhilHealthRemittance(from: string, to: string) {
  return useQuery({
    queryKey: ["payroll-reports", "philhealth-remittance", from, to],
    queryFn: () => payrollReportsApi.philHealthRemittance(from, to),
  });
}

export function usePagIbigRemittance(from: string, to: string) {
  return useQuery({
    queryKey: ["payroll-reports", "pagibig-remittance", from, to],
    queryFn: () => payrollReportsApi.pagIbigRemittance(from, to),
  });
}

export function useWtaxRemittance(from: string, to: string) {
  return useQuery({
    queryKey: ["payroll-reports", "wtax-remittance", from, to],
    queryFn: () => payrollReportsApi.wtaxRemittance(from, to),
  });
}

export function useBankDisbursement(from: string, to: string) {
  return useQuery({
    queryKey: ["payroll-reports", "bank-disbursement", from, to],
    queryFn: () => payrollReportsApi.bankDisbursement(from, to),
  });
}

export function useDeductionLedger(asOf: string) {
  return useQuery({
    queryKey: ["payroll-reports", "deduction-ledger", asOf],
    queryFn: () => payrollReportsApi.deductionLedger(asOf),
  });
}

export function useCashBondReport(asOf: string) {
  return useQuery({
    queryKey: ["payroll-reports", "cash-bond", asOf],
    queryFn: () => payrollReportsApi.cashBondReport(asOf),
  });
}

export function useLeaveLedger(year: number) {
  return useQuery({
    queryKey: ["payroll-reports", "leave-ledger", year],
    queryFn: () => payrollReportsApi.leaveLedger(year),
  });
}

export function useRetirementLedger(from: string, to: string) {
  return useQuery({
    queryKey: ["payroll-reports", "retirement-ledger", from, to],
    queryFn: () => payrollReportsApi.retirementLedger(from, to),
  });
}

export function useAdjustRetirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollReportsApi.adjustRetirement,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["payroll-reports", "retirement-ledger"],
      }),
  });
}

export function useUniformAllowanceLedger(from: string, to: string) {
  return useQuery({
    queryKey: ["payroll-reports", "uniform-allowance-ledger", from, to],
    queryFn: () => payrollReportsApi.uniformAllowanceLedger(from, to),
  });
}

export function useAdjustUniformAllowance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollReportsApi.adjustUniformAllowance,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["payroll-reports", "uniform-allowance-ledger"],
      }),
  });
}

export function useUniformAllowanceBalances(employeeIds: string[]) {
  return useQuery({
    queryKey: ["payroll-reports", "uniform-allowance-balances", employeeIds],
    queryFn: () => payrollReportsApi.uniformAllowanceBalances(employeeIds),
    enabled: employeeIds.length > 0,
  });
}

export function useReleaseUniformAllowance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollReportsApi.releaseUniformAllowance,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["payroll-reports", "uniform-allowance-ledger"],
      }),
  });
}

export function useReimbursementList(from: string, to: string) {
  return useQuery({
    queryKey: ["payroll-reports", "reimbursement-list", from, to],
    queryFn: () => payrollReportsApi.reimbursementList(from, to),
  });
}

export function useAdjustLeaveCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollReportsApi.adjustLeaveCredits,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["payroll-reports", "leave-ledger"],
      }),
  });
}

export function useCostSummary(
  from: string,
  to: string,
  groupBy: CostSummaryGroupBy,
) {
  return useQuery({
    queryKey: ["payroll-reports", "cost-summary", from, to, groupBy],
    queryFn: () => payrollReportsApi.costSummary(from, to, groupBy),
  });
}

export function useYtdSummary(year: number) {
  return useQuery({
    queryKey: ["payroll-reports", "ytd-summary", year],
    queryFn: () => payrollReportsApi.ytdSummary(year),
  });
}

export function useThirteenthMonth(year: number) {
  return useQuery({
    queryKey: ["payroll-reports", "13th-month-pay", year],
    queryFn: () => payrollReportsApi.thirteenthMonth(year),
  });
}

export function useMonthlyRemittanceReturn(
  from: string,
  to: string,
  amendedReturn: boolean,
) {
  return useQuery({
    queryKey: ["payroll-reports", "1601c", from, to, amendedReturn],
    queryFn: () =>
      payrollReportsApi.monthlyRemittanceReturn(from, to, amendedReturn),
  });
}

export function useAlphalist(year: number) {
  return useQuery({
    queryKey: ["payroll-reports", "alphalist", year],
    queryFn: () => payrollReportsApi.alphalist(year),
  });
}

export function useBir2316(employeeId: string, year: number) {
  return useQuery({
    queryKey: ["payroll-reports", "2316", employeeId, year],
    queryFn: () => payrollReportsApi.bir2316(employeeId, year),
    enabled: !!employeeId,
  });
}
