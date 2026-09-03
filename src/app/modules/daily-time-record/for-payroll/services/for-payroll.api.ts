import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DtrBatchModel } from "../models/api/response/dtr-batch-response.model";
import type { PayrollRunRequest } from "../models/api/request/payroll-run-request.model";
import type { GenerateThirteenthMonthRequest } from "../models/api/request/generate-thirteenth-month-request.model";
import type { GenerateLastPayRequest } from "../models/api/request/generate-last-pay-request.model";
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

  // Lump-sum 13th month pay run — no DTR batch to select from, so a separate payload shape
  // from calculate/generate. Post/Delete of the resulting draft reuse postPayrollBatch/
  // deletePayrollBatch below (batch-generic on the backend).
  generateThirteenthMonth(
    payload: GenerateThirteenthMonthRequest,
  ): Promise<PayrollRunResponse> {
    return httpClient.postUnwrapped<PayrollRunResponse>(
      `${PAYROLL_ENDPOINT}/generate-13th-month`,
      payload,
    );
  },

  // Separated employees' final settlement — prorated 13th month + leave conversion, netted
  // against outstanding loans. Same Post/Delete/print draft lifecycle as generateThirteenthMonth.
  generateLastPay(
    payload: GenerateLastPayRequest,
  ): Promise<PayrollRunResponse> {
    return httpClient.postUnwrapped<PayrollRunResponse>(
      `${PAYROLL_ENDPOINT}/generate-last-pay`,
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

  // Post and Delete are run-level transactions, not per-employee ones — an employee's
  // payroll is never generated on its own, so it's never posted or deleted on its own
  // either. batchId is the PayrollBatch header row's id (PayrollRunResult.payrollBatchId).
  // See PayrollProcessorService.PostBatchAsync / DeleteBatchAsync.
  postPayrollBatch(batchId: string): Promise<void> {
    return httpClient.post<void>(
      `${PAYROLL_ENDPOINT}/batch/${batchId}/post`,
      null,
    );
  },

  deletePayrollBatch(batchId: string): Promise<void> {
    return httpClient.delete<void>(`${PAYROLL_ENDPOINT}/batch/${batchId}`);
  },
};
