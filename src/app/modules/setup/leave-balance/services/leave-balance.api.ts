import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { AdjustLeaveBalance } from "../models/api/request/adjust-leave-balance.model";
import type {
  AdjustLeaveBalanceResponse,
  DtrReconcileLine,
  LeaveBalanceResponse,
} from "../models/api/response/leave-balance-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "leaves");

export const leaveBalanceApi = {
  getBalance(
    employeeId: string,
    leaveId: string,
    year: number,
  ): Promise<LeaveBalanceResponse> {
    return httpClient.getUnwrapped<LeaveBalanceResponse>(
      `${ENDPOINT}/credits`,
      { params: { employeeId, leaveId, year } },
    );
  },
  adjust(data: AdjustLeaveBalance): Promise<AdjustLeaveBalanceResponse> {
    return httpClient.postUnwrapped<AdjustLeaveBalanceResponse>(
      `${ENDPOINT}/credits/adjust`,
      data,
    );
  },
  // Recomputes what posted DTRs should have charged against leave credits for a year.
  // dryRun only previews; otherwise the differences are written as ledger corrections.
  reconcileWithDtr(year: number, dryRun: boolean): Promise<DtrReconcileLine[]> {
    return httpClient.postUnwrapped<DtrReconcileLine[]>(
      `${ENDPOINT}/credits/reconcile-dtr`,
      null,
      { params: { year, dryRun } },
    );
  },
};
