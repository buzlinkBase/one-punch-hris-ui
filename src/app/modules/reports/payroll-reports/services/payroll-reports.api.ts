import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  ReportEnvelope,
  ContributionRemittanceResponse,
  BankDisbursementResponse,
  LoanLedgerResponse,
  LeaveCreditsBalanceResponse,
  CostSummaryResponse,
  CostSummaryGroupBy,
  YtdPayrollSummaryResponse,
  ThirteenthMonthResponse,
} from "../models/api/response/payroll-reports.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "payroll-reports");

async function get<T>(path: string, params: Record<string, string | number>) {
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
  loanLedger: (asOf: string) =>
    get<LoanLedgerResponse>("loan-ledger", { asOf }),
  leaveLedger: (year: number) =>
    get<LeaveCreditsBalanceResponse>("leave-ledger", { year }),
  costSummary: (from: string, to: string, groupBy: CostSummaryGroupBy) =>
    get<CostSummaryResponse>("cost-summary", { from, to, groupBy }),
  ytdSummary: (year: number) =>
    get<YtdPayrollSummaryResponse>("ytd-summary", { year }),
  thirteenthMonth: (year: number) =>
    get<ThirteenthMonthResponse>("13th-month-pay", { year }),
};
