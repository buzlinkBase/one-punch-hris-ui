import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DtrBatchModel } from "../models/api/response/dtr-batch-response.model";
import type { PayrollRunRequest } from "../models/api/request/payroll-run-request.model";
import type { GenerateThirteenthMonthRequest } from "../models/api/request/generate-thirteenth-month-request.model";
import type { GenerateLastPayRequest } from "../models/api/request/generate-last-pay-request.model";
import type { TaxAnnualizationRunRequest } from "../models/api/request/tax-annualization-run-request.model";
import type { PayrollRunResponse } from "../models/api/response/payroll-run-result.model";
import type { TaxAnnualizationPreviewResponse } from "../models/api/response/tax-annualization-preview.model";
import type {
  AvailableSalaryAdjustment,
  AvailableOtherIncome,
  LastPayAttendanceWarning,
} from "../models/api/response/last-pay-review.model";

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

  // Year-End Tax Annualization review step — recomputes each in-scope employee's true annual
  // tax due vs. tax withheld YTD without persisting anything, so HR can review before
  // generateYearEndAdjustment is called. See TaxAnnualizationRunPayload.
  previewYearEndAdjustment(
    payload: TaxAnnualizationRunRequest,
  ): Promise<TaxAnnualizationPreviewResponse> {
    return httpClient.postUnwrapped<TaxAnnualizationPreviewResponse>(
      `${PAYROLL_ENDPOINT}/preview-year-end-adjustment`,
      payload,
    );
  },

  // Persists the refund/collection adjustment as a PayrollType.YearEndAdjustment draft — same
  // Post/Delete/print draft lifecycle as generateThirteenthMonth/generateLastPay.
  generateYearEndAdjustment(
    payload: TaxAnnualizationRunRequest,
  ): Promise<PayrollRunResponse> {
    return httpClient.postUnwrapped<PayrollRunResponse>(
      `${PAYROLL_ENDPOINT}/generate-year-end-adjustment`,
      payload,
    );
  },

  // Review-step data for the Last Pay generation screen — see LastPayRunPayload.
  // SalaryAdjustmentIds/OtherIncomeScheduleIds and PayrollsController's last-pay/* GETs.
  getAvailableSalaryAdjustments(
    employeeIds: string[],
  ): Promise<{ data: AvailableSalaryAdjustment[]; total: number }> {
    return httpClient.getUnwrapped<{
      data: AvailableSalaryAdjustment[];
      total: number;
    }>(`${PAYROLL_ENDPOINT}/last-pay/available-salary-adjustments`, {
      params: { employeeIds },
      paramsSerializer: { indexes: null },
    });
  },

  getAvailableOtherIncome(
    employeeIds: string[],
  ): Promise<{ data: AvailableOtherIncome[]; total: number }> {
    return httpClient.getUnwrapped<{
      data: AvailableOtherIncome[];
      total: number;
    }>(`${PAYROLL_ENDPOINT}/last-pay/available-other-income`, {
      params: { employeeIds },
      paramsSerializer: { indexes: null },
    });
  },

  getLastPayAttendanceWarnings(
    employeeIds: string[],
  ): Promise<{ data: LastPayAttendanceWarning[]; total: number }> {
    return httpClient.getUnwrapped<{
      data: LastPayAttendanceWarning[];
      total: number;
    }>(`${PAYROLL_ENDPOINT}/last-pay/attendance-warnings`, {
      params: { employeeIds },
      paramsSerializer: { indexes: null },
    });
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
