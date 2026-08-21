import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DtrBatchModel } from "../models/api/response/dtr-batch-response.model";
import type { PayrollRunRequest } from "../models/api/request/payroll-run-request.model";
import type { PayrollRunResponse } from "../models/api/response/payroll-run-result.model";

const DTR_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords");
const PAYROLL_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "payrolls");

export const forPayrollApi = {
  getBatches(from?: string, to?: string): Promise<DtrBatchModel[]> {
    return httpClient.getUnwrapped<DtrBatchModel[]>(
      `${DTR_ENDPOINT}/batch-codes`,
      { params: { from, to } },
    );
  },

  postBatch(batchCode: string): Promise<void> {
    return httpClient.post<void>(`${DTR_ENDPOINT}/post`, null, {
      params: { batchCode },
    });
  },

  unpostBatch(batchCode: string): Promise<void> {
    return httpClient.post<void>(`${DTR_ENDPOINT}/unpost`, null, {
      params: { batchCode },
    });
  },

  calculate(payload: PayrollRunRequest): Promise<PayrollRunResponse> {
    return httpClient.postUnwrapped<PayrollRunResponse>(
      `${PAYROLL_ENDPOINT}/calculate`,
      payload,
    );
  },

  generate(payload: PayrollRunRequest): Promise<PayrollRunResponse> {
    return httpClient.postUnwrapped<PayrollRunResponse>(
      `${PAYROLL_ENDPOINT}/generate`,
      payload,
    );
  },

  getPayrolls(params: {
    from: string;
    to: string;
    employeeId?: string;
    clientId?: string;
    payrollGroupId?: string;
  }): Promise<PayrollRunResponse> {
    return httpClient.getUnwrapped<PayrollRunResponse>(`${PAYROLL_ENDPOINT}`, {
      params,
    });
  },
};
