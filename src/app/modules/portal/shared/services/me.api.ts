import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { EmployeeFullResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import type { PayrollRunResponse } from "@/app/modules/daily-time-record/for-payroll/models/api/response/payroll-run-result.model";

const BASE_URL = buildApiUrl(API_PREFIX.hrms, "me");

export const meApi = {
  /** 404s when the logged-in user has no linked Employee record — silenced, not an error. */
  async getMyEmployee(): Promise<EmployeeFullResponse | null> {
    try {
      return await httpClient.getUnwrapped<EmployeeFullResponse>(
        `${BASE_URL}/employee`,
        { _skipErrorNotification: true },
      );
    } catch {
      return null;
    }
  },

  getMyPayrolls(params: {
    from: string;
    to: string;
  }): Promise<PayrollRunResponse> {
    return httpClient.get<PayrollRunResponse>(`${BASE_URL}/payrolls`, {
      params,
    });
  },
};
