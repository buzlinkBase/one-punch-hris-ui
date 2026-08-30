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

export function useLoanLedger(asOf: string) {
  return useQuery({
    queryKey: ["payroll-reports", "loan-ledger", asOf],
    queryFn: () => payrollReportsApi.loanLedger(asOf),
  });
}

export function useLeaveLedger(year: number) {
  return useQuery({
    queryKey: ["payroll-reports", "leave-ledger", year],
    queryFn: () => payrollReportsApi.leaveLedger(year),
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
