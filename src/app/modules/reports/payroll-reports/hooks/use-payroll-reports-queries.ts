import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { payrollReportsApi } from "../services/payroll-reports.api";
import type { CostSummaryGroupBy } from "../models/api/response/payroll-reports.model";
import type { EmployeeScopeFilter } from "../models/api/request/employee-scope-filter.model";

export function useSssRemittance(from: string, to: string, clientId?: string) {
  return useQuery({
    queryKey: ["payroll-reports", "sss-remittance", from, to, clientId],
    queryFn: () => payrollReportsApi.sssRemittance(from, to, clientId),
  });
}

export function usePhilHealthRemittance(
  from: string,
  to: string,
  clientId?: string,
) {
  return useQuery({
    queryKey: ["payroll-reports", "philhealth-remittance", from, to, clientId],
    queryFn: () => payrollReportsApi.philHealthRemittance(from, to, clientId),
  });
}

export function usePagIbigRemittance(
  from: string,
  to: string,
  clientId?: string,
) {
  return useQuery({
    queryKey: ["payroll-reports", "pagibig-remittance", from, to, clientId],
    queryFn: () => payrollReportsApi.pagIbigRemittance(from, to, clientId),
  });
}

export function useWtaxRemittance(from: string, to: string, clientId?: string) {
  return useQuery({
    queryKey: ["payroll-reports", "wtax-remittance", from, to, clientId],
    queryFn: () => payrollReportsApi.wtaxRemittance(from, to, clientId),
  });
}

export function useBankDisbursement(
  from: string,
  to: string,
  clientId?: string,
) {
  return useQuery({
    queryKey: ["payroll-reports", "bank-disbursement", from, to, clientId],
    queryFn: () => payrollReportsApi.bankDisbursement(from, to, clientId),
  });
}

export function useDeductionLedger(asOf: string, clientId?: string) {
  return useQuery({
    queryKey: ["payroll-reports", "deduction-ledger", asOf, clientId],
    queryFn: () => payrollReportsApi.deductionLedger(asOf, clientId),
  });
}

export function useCashBondReport(asOf: string, clientId?: string) {
  return useQuery({
    queryKey: ["payroll-reports", "cash-bond", asOf, clientId],
    queryFn: () => payrollReportsApi.cashBondReport(asOf, clientId),
  });
}

// Ledger details queries (the "View ledger" drawer) live under their report's key prefix, so each
// adjust mutation's prefix invalidation refreshes the open drawer too. Disabled until a row is
// picked.
export function useCashBondEntries(
  employeeId: string | undefined,
  asOf: string,
) {
  return useQuery({
    queryKey: ["payroll-reports", "cash-bond", "entries", employeeId, asOf],
    queryFn: () => payrollReportsApi.cashBondEntries(employeeId!, asOf),
    enabled: !!employeeId,
  });
}

// Refreshes every screen showing a cash bond total: this report (any "as of"), the employee's
// My Cash Bond, and Last Pay's cash bond status.
export function useAdjustCashBond() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollReportsApi.adjustCashBond,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-reports", "cash-bond"],
      });
      queryClient.invalidateQueries({ queryKey: ["me", "cash-bond"] });
      queryClient.invalidateQueries({
        queryKey: ["last-pay-cash-bond-status"],
      });
    },
  });
}

export function useCashBondRateHistory(employeeId: string | undefined) {
  return useQuery({
    queryKey: ["payroll-reports", "cash-bond", "rate-history", employeeId],
    queryFn: () => payrollReportsApi.cashBondRateHistory(employeeId!),
    enabled: !!employeeId,
  });
}

// The new rate shows in this report, in the employee's My Cash Bond (rate per payroll) and in
// the employee record, and applies from the next payroll run.
export function useChangeCashBondRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollReportsApi.changeCashBondRate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-reports", "cash-bond"],
      });
      queryClient.invalidateQueries({ queryKey: ["me", "cash-bond"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useLeaveLedger(year: number, scope: EmployeeScopeFilter = {}) {
  return useQuery({
    queryKey: ["payroll-reports", "leave-ledger", year, scope],
    queryFn: () => payrollReportsApi.leaveLedger(year, scope),
  });
}

export function useLeaveEntries(
  employeeId: string | undefined,
  leaveId: string | undefined,
  year: number,
) {
  return useQuery({
    queryKey: [
      "payroll-reports",
      "leave-ledger",
      "entries",
      employeeId,
      leaveId,
      year,
    ],
    queryFn: () => payrollReportsApi.leaveEntries(employeeId!, leaveId!, year),
    enabled: !!employeeId && !!leaveId,
  });
}

export function useRetirementLedger(asOf: string, clientId?: string) {
  return useQuery({
    queryKey: ["payroll-reports", "retirement-ledger", asOf, clientId],
    queryFn: () => payrollReportsApi.retirementLedger(asOf, clientId),
  });
}

export function useRetirementEntries(
  employeeId: string | undefined,
  asOf: string,
) {
  return useQuery({
    queryKey: [
      "payroll-reports",
      "retirement-ledger",
      "entries",
      employeeId,
      asOf,
    ],
    queryFn: () => payrollReportsApi.retirementEntries(employeeId!, asOf),
    enabled: !!employeeId,
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

export function useUniformAllowanceLedger(
  asOf: string,
  clientId?: string,
  separatedWithBalance?: boolean,
) {
  return useQuery({
    queryKey: [
      "payroll-reports",
      "uniform-allowance-ledger",
      asOf,
      clientId,
      separatedWithBalance,
    ],
    queryFn: () =>
      payrollReportsApi.uniformAllowanceLedger(
        asOf,
        clientId,
        separatedWithBalance,
      ),
  });
}

export function useUniformAllowanceEntries(
  employeeId: string | undefined,
  asOf: string,
) {
  return useQuery({
    queryKey: [
      "payroll-reports",
      "uniform-allowance-ledger",
      "entries",
      employeeId,
      asOf,
    ],
    queryFn: () => payrollReportsApi.uniformAllowanceEntries(employeeId!, asOf),
    enabled: !!employeeId,
  });
}

// The ledger list and an open employee's credit schedule (its balance) both change.
function invalidateUniformAllowance(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: ["payroll-reports", "uniform-allowance-ledger"],
    }),
    queryClient.invalidateQueries({
      queryKey: ["payroll-reports", "uniform-allowance-schedule"],
    }),
  ]);
}

export function useAdjustUniformAllowance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollReportsApi.adjustUniformAllowance,
    onSuccess: () => invalidateUniformAllowance(queryClient),
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
    onSuccess: () => invalidateUniformAllowance(queryClient),
  });
}

export function useReimbursementList(
  from: string,
  to: string,
  clientId?: string,
) {
  return useQuery({
    queryKey: ["payroll-reports", "reimbursement-list", from, to, clientId],
    queryFn: () => payrollReportsApi.reimbursementList(from, to, clientId),
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
  clientId?: string,
) {
  return useQuery({
    queryKey: ["payroll-reports", "cost-summary", from, to, groupBy, clientId],
    queryFn: () => payrollReportsApi.costSummary(from, to, groupBy, clientId),
  });
}

export function useYtdSummary(year: number, clientId?: string) {
  return useQuery({
    queryKey: ["payroll-reports", "ytd-summary", year, clientId],
    queryFn: () => payrollReportsApi.ytdSummary(year, clientId),
  });
}

export function useThirteenthMonth(year: number, clientId?: string) {
  return useQuery({
    queryKey: ["payroll-reports", "13th-month-pay", year, clientId],
    queryFn: () => payrollReportsApi.thirteenthMonth(year, clientId),
  });
}

export function useMonthlyRemittanceReturn(
  from: string,
  to: string,
  amendedReturn: boolean,
  clientId?: string,
) {
  return useQuery({
    queryKey: ["payroll-reports", "1601c", from, to, amendedReturn, clientId],
    queryFn: () =>
      payrollReportsApi.monthlyRemittanceReturn(
        from,
        to,
        amendedReturn,
        clientId,
      ),
  });
}

export function useAlphalist(year: number, clientId?: string) {
  return useQuery({
    queryKey: ["payroll-reports", "alphalist", year, clientId],
    queryFn: () => payrollReportsApi.alphalist(year, clientId),
  });
}

export function useBir2316(employeeId: string, year: number) {
  return useQuery({
    queryKey: ["payroll-reports", "2316", employeeId, year],
    queryFn: () => payrollReportsApi.bir2316(employeeId, year),
    enabled: !!employeeId,
  });
}
