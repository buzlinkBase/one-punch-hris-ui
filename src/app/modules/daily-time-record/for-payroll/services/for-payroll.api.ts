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
  LastPayCashBondStatus,
} from "../models/api/response/last-pay-review.model";
import type { PayrollBatchListModel } from "../models/api/response/payroll-batch-list.model";

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

  getLastPayCashBondStatus(
    employeeIds: string[],
  ): Promise<{ data: LastPayCashBondStatus[]; total: number }> {
    return httpClient.getUnwrapped<{
      data: LastPayCashBondStatus[];
      total: number;
    }>(`${PAYROLL_ENDPOINT}/last-pay/cash-bond-status`, {
      params: { employeeIds },
      paramsSerializer: { indexes: null },
    });
  },

  // Either from/to or payrollBatchId is required -- payrollBatchId, when given, replaces the
  // date range entirely and returns exactly one run's rows (see PayrollsController.Get).
  getPayrolls(params: {
    from?: string;
    to?: string;
    employeeId?: string;
    clientId?: string;
    payrollGroupId?: string;
    payrollBatchId?: string;
  }): Promise<PayrollRunResponse> {
    return httpClient.getUnwrapped<PayrollRunResponse>(`${PAYROLL_ENDPOINT}`, {
      params,
    });
  },

  // Approve/Decline/Delete are run-level transactions, not per-employee ones — an employee's
  // payroll is never generated on its own, so it's never approved, declined, or deleted on its
  // own either. batchId is the PayrollBatch header row's id (PayrollRunResult.payrollBatchId).
  // Approve/Decline route through the shared PayrollPosting approval engine instance (started
  // automatically at Generate/Save time) rather than posting directly — see
  // PayrollBatchLifecycleService.ApproveBatchAsync / DeclineBatchAsync.
  approveBatch(batchId: string, note?: string): Promise<void> {
    return httpClient.post<void>(
      `${PAYROLL_ENDPOINT}/batch/${batchId}/approve`,
      { note },
    );
  },

  declineBatch(batchId: string, note?: string): Promise<void> {
    return httpClient.post<void>(
      `${PAYROLL_ENDPOINT}/batch/${batchId}/decline`,
      { note },
    );
  },

  deletePayrollBatch(batchId: string): Promise<void> {
    return httpClient.delete<void>(`${PAYROLL_ENDPOINT}/batch/${batchId}`);
  },

  // Batch-list projection for the Saved Payroll Runs tab -- independent of getPayrolls' own
  // date-scoped report query. Defaults server-side to today minus 5 months / plus 1 month when
  // from/to are omitted, same as DTR's batch-codes endpoint.
  getPayrollBatches(
    from?: string,
    to?: string,
  ): Promise<PayrollBatchListModel[]> {
    return httpClient.getUnwrapped<PayrollBatchListModel[]>(
      `${PAYROLL_ENDPOINT}/batches`,
      { params: { from, to } },
    );
  },

  // An already-posted batch can't be deleted outright — this starts a separate
  // PayrollPostingDeletion approval instance instead. See PayrollBatchLifecycleService.
  // RequestDeletionAsync/ApproveDeletionAsync/DeclineDeletionAsync.
  requestBatchDeletion(batchId: string): Promise<void> {
    return httpClient.post<void>(
      `${PAYROLL_ENDPOINT}/batch/${batchId}/request-deletion`,
      null,
    );
  },

  approveBatchDeletion(batchId: string, note?: string): Promise<void> {
    return httpClient.post<void>(
      `${PAYROLL_ENDPOINT}/batch/${batchId}/approve-deletion`,
      { note },
    );
  },

  declineBatchDeletion(batchId: string, note?: string): Promise<void> {
    return httpClient.post<void>(
      `${PAYROLL_ENDPOINT}/batch/${batchId}/decline-deletion`,
      { note },
    );
  },
};
