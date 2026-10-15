import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  ReportEnvelope,
  ContributionRemittanceResponse,
  BankDisbursementResponse,
  DeductionLedgerResponse,
  CashBondReportResponse,
  AdjustCashBondRequest,
  LeaveCreditsBalanceResponse,
  LedgerEntryResponse,
  FundLedgerSummaryResponse,
  AdjustRetirementRequest,
  UniformAllowanceBalanceResponse,
  AdjustUniformAllowanceRequest,
  ReleaseUniformAllowanceRequest,
  ReleaseUniformAllowanceResponse,
  ReimbursementListResponse,
  AdjustLeaveCreditsRequest,
  AdjustLeaveCreditsResponse,
  CostSummaryResponse,
  CostSummaryGroupBy,
  YtdPayrollSummaryResponse,
  ThirteenthMonthResponse,
  MonthlyRemittanceReturnResponse,
  MonthlyRemittanceReturnEmployeeResponse,
  AlphalistEntryResponse,
  Bir2316Response,
} from "../models/api/response/payroll-reports.model";
import type { EmployeeScopeFilter } from "../models/api/request/employee-scope-filter.model";

// PayrollReportsController's [Route("api/v{version:apiVersion}/[controller]")] resolves the
// [controller] token to the literal class name (PayrollReports -> payrollreports) — there is
// no kebab-case/slugify route convention registered for this API, so the segment must match
// that exactly, not "payroll-reports".
const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "payrollreports");
const LEAVES_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "leaves");
const UNIFORM_ALLOWANCE_ENDPOINT = buildApiUrl(
  API_PREFIX.hrms,
  "uniformallowance",
);
const RETIREMENT_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "retirement");
const CASH_BOND_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "cash-bond");

// An undefined param is dropped by axios, so optional filters just aren't sent.
async function get<T>(
  path: string,
  params: Record<string, string | number | undefined>,
) {
  const res = await httpClient.getUnwrapped<ReportEnvelope<T>>(
    `${ENDPOINT}/${path}`,
    { params },
  );
  return res?.data ?? [];
}

export const payrollReportsApi = {
  sssRemittance: (from: string, to: string) =>
    get<ContributionRemittanceResponse>("sss-remittance", { from, to }),
  philHealthRemittance: (from: string, to: string) =>
    get<ContributionRemittanceResponse>("philhealth-remittance", { from, to }),
  pagIbigRemittance: (from: string, to: string) =>
    get<ContributionRemittanceResponse>("pagibig-remittance", { from, to }),
  wtaxRemittance: (from: string, to: string) =>
    get<ContributionRemittanceResponse>("wtax-remittance", { from, to }),
  bankDisbursement: (from: string, to: string) =>
    get<BankDisbursementResponse>("bank-disbursement", { from, to }),
  deductionLedger: (asOf: string) =>
    get<DeductionLedgerResponse>("deduction-ledger", { asOf }),
  cashBondReport: (asOf: string) =>
    get<CashBondReportResponse>("cash-bond", { asOf }),
  cashBondEntries: (employeeId: string, asOf: string) =>
    get<LedgerEntryResponse>(`cash-bond/${employeeId}/entries`, { asOf }),
  adjustCashBond: (payload: AdjustCashBondRequest) =>
    httpClient.postUnwrapped<void>(`${CASH_BOND_ENDPOINT}/adjust`, payload),
  leaveLedger: (year: number, scope: EmployeeScopeFilter = {}) =>
    get<LeaveCreditsBalanceResponse>("leave-ledger", { year, ...scope }),
  leaveEntries: (employeeId: string, leaveId: string, year: number) =>
    get<LedgerEntryResponse>(`leave-ledger/${employeeId}/${leaveId}/entries`, {
      year,
    }),
  retirementLedger: (asOf: string) =>
    get<FundLedgerSummaryResponse>("retirement-ledger", { asOf }),
  retirementEntries: (employeeId: string, asOf: string) =>
    get<LedgerEntryResponse>(`retirement-ledger/${employeeId}/entries`, {
      asOf,
    }),
  adjustRetirement: (payload: AdjustRetirementRequest) =>
    httpClient.postUnwrapped<void>(`${RETIREMENT_ENDPOINT}/adjust`, payload),
  uniformAllowanceLedger: (asOf: string) =>
    get<FundLedgerSummaryResponse>("uniform-allowance-ledger", { asOf }),
  uniformAllowanceEntries: (employeeId: string, asOf: string) =>
    get<LedgerEntryResponse>(`uniform-allowance-ledger/${employeeId}/entries`, {
      asOf,
    }),
  adjustUniformAllowance: (payload: AdjustUniformAllowanceRequest) =>
    httpClient.postUnwrapped<void>(
      `${UNIFORM_ALLOWANCE_ENDPOINT}/adjust`,
      payload,
    ),
  releaseUniformAllowance: (payload: ReleaseUniformAllowanceRequest) =>
    httpClient.postUnwrapped<ReleaseUniformAllowanceResponse>(
      `${UNIFORM_ALLOWANCE_ENDPOINT}/release`,
      payload,
    ),
  // True current balances (not a date-range-dependent value read off the ledger report) --
  // used to default each selected employee's Release amount.
  uniformAllowanceBalances: (
    employeeIds: string[],
  ): Promise<UniformAllowanceBalanceResponse[]> =>
    httpClient
      .getUnwrapped<UniformAllowanceBalanceResponse[]>(
        `${UNIFORM_ALLOWANCE_ENDPOINT}/balances`,
        { params: { employeeIds }, paramsSerializer: { indexes: null } },
      )
      .then((res) => res ?? []),
  reimbursementList: (from: string, to: string) =>
    get<ReimbursementListResponse>("reimbursement-list", { from, to }),
  adjustLeaveCredits: (payload: AdjustLeaveCreditsRequest) =>
    httpClient.postUnwrapped<AdjustLeaveCreditsResponse>(
      `${LEAVES_ENDPOINT}/credits/adjust`,
      payload,
    ),
  costSummary: (from: string, to: string, groupBy: CostSummaryGroupBy) =>
    get<CostSummaryResponse>("cost-summary", { from, to, groupBy }),
  ytdSummary: (year: number) =>
    get<YtdPayrollSummaryResponse>("ytd-summary", { year }),
  thirteenthMonth: (year: number) =>
    get<ThirteenthMonthResponse>("13th-month-pay", { year }),
  // Distinct from the generic get<T>() helper — this endpoint's envelope carries a `summary`
  // object alongside `data` (the per-employee drill-down rows), not just a flat array.
  async monthlyRemittanceReturn(
    from: string,
    to: string,
    amendedReturn: boolean,
  ): Promise<{
    employees: MonthlyRemittanceReturnEmployeeResponse[];
    summary: MonthlyRemittanceReturnResponse;
  }> {
    const res = await httpClient.getUnwrapped<{
      data: MonthlyRemittanceReturnEmployeeResponse[];
      summary: MonthlyRemittanceReturnResponse;
    }>(`${ENDPOINT}/1601c`, { params: { from, to, amendedReturn } });
    return { employees: res?.data ?? [], summary: res.summary };
  },
  alphalist: (year: number) =>
    get<AlphalistEntryResponse>("alphalist", { year }),
  bir2316: (employeeId: string, year: number) =>
    get<Bir2316Response>("2316", { employeeId, year }),
  // URL builders for the /print (PDF, opened in a new tab) and /export (raw file download)
  // actions — these return blobs, not JSON, so they're called directly via
  // openPdfInNewTab/downloadBlobFile (src/shared/utils/download-file.util.ts) rather than
  // through the get<T>() JSON helper above.
  urls: {
    monthlyRemittanceReturnPrint: `${ENDPOINT}/1601c/print`,
    alphalistPrint: `${ENDPOINT}/alphalist/print`,
    alphalistExport: `${ENDPOINT}/alphalist/export`,
    bir2316Print: `${ENDPOINT}/2316/print`,
    sssR3Print: `${ENDPOINT}/sss-r3/print`,
    sssR3Export: `${ENDPOINT}/sss-r3/export`,
    philHealthEprsPrint: `${ENDPOINT}/philhealth-eprs/print`,
    philHealthEprsExport: `${ENDPOINT}/philhealth-eprs/export`,
    pagIbigMcrfPrint: `${ENDPOINT}/pagibig-mcrf/print`,
    pagIbigMcrfExport: `${ENDPOINT}/pagibig-mcrf/export`,
  },
};
