import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DtrDetailResponse } from "../models/api/response/dtr-detail-response.model";
import type { DtrDetailFilter } from "../models/api/request/dtr-detail-filter.model";
import type { SaveDtrDraftRequest } from "../models/api/request/save-dtr-draft.model";
import type { DtrEmployeeSummaryResponse } from "../models/api/response/dtr-employee-summary.model";
import type { BatchesModel } from "../../summary/models/api/response/batches.model";
import type { PayrollReadinessEmployee } from "../../for-payroll/models/api/response/payroll-readiness.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/dtr-detail");
const SUMMARY_ENDPOINT = buildApiUrl(
  API_PREFIX.hrms,
  "dailyrecords/dtr-summary",
);
const SAVE_DRAFT_ENDPOINT = buildApiUrl(
  API_PREFIX.hrms,
  "dailyrecords/save-draft",
);
const SAVE_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords");
const BATCH_LIST_ENDPOINT = buildApiUrl(
  API_PREFIX.hrms,
  "dailyrecords/batch-codes",
);
const LOAD_DETAIL_ENDPOINT = buildApiUrl(
  API_PREFIX.hrms,
  "dailyrecords/load-detail",
);
const BATCH_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/batch");
const COVERAGE_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/coverage");

function buildParams(filter: DtrDetailFilter): Record<string, string> {
  const p: Record<string, string> = {};
  if (filter.fromDate) p.fromDate = filter.fromDate;
  if (filter.toDate) p.toDate = filter.toDate;
  if (filter.branchId) p.branchId = filter.branchId;
  if (filter.departmentId) p.departmentId = filter.departmentId;
  if (filter.clientId) p.clientId = filter.clientId;
  if (filter.employeeId) p.employeeId = filter.employeeId;
  if (filter.payrollGroupId) p.payrollGroupId = filter.payrollGroupId;
  if (filter.operationAreaId) p.operationAreaId = filter.operationAreaId;
  return p;
}

export const dtrDetailApi = {
  // A failed generate propagates -- returning [] showed it as "no DTR for this period".
  getAll(filter: DtrDetailFilter = {}): Promise<DtrDetailResponse[]> {
    return httpClient.getUnwrapped<DtrDetailResponse[]>(ENDPOINT, {
      params: buildParams(filter),
    });
  },

  // One summary per employee -- what the Calculate DTR review table shows. A company with
  // thousands of employees is tens of thousands of day rows, which stay on the server until one
  // employee is expanded (getAll with that employeeId).
  getSummary(
    filter: DtrDetailFilter = {},
  ): Promise<DtrEmployeeSummaryResponse[]> {
    return httpClient.getUnwrapped<DtrEmployeeSummaryResponse[]>(
      SUMMARY_ENDPOINT,
      { params: buildParams(filter) },
    );
  },

  // Queues the save (202) -- the server recomputes and saves the rows in the background and
  // notifies the requester through the bell, see DtrDraftSaveService.
  queueSaveDraft(request: SaveDtrDraftRequest): Promise<void> {
    return httpClient.post<void>(SAVE_DRAFT_ENDPOINT, request);
  },

  // Which days of the cutoff already have saved DTR, per employee (draft, approved or paid) --
  // see DailyRecordsController.GetCoverage. Same row shape as the Payroll Run readiness list.
  getCoverage(params: {
    from: string;
    to: string;
  }): Promise<PayrollReadinessEmployee[]> {
    return httpClient
      .getUnwrapped<{
        data: PayrollReadinessEmployee[];
        total: number;
      }>(COVERAGE_ENDPOINT, { params })
      .then((res) => res.data ?? []);
  },

  save(records: DtrDetailResponse[]): Promise<DtrDetailResponse[]> {
    return httpClient.postUnwrapped<DtrDetailResponse[]>(
      SAVE_ENDPOINT,
      records,
    );
  },

  // A missing from/to is open-ended server-side -- callers pass the range they want listed.
  getBatchCodes(from?: string, to?: string): Promise<BatchesModel[]> {
    return httpClient.getUnwrapped<BatchesModel[]>(BATCH_LIST_ENDPOINT, {
      params: { from, to },
    });
  },

  loadDetail(batchCode: string): Promise<DtrDetailResponse[]> {
    return httpClient.postUnwrapped<DtrDetailResponse[]>(
      `${LOAD_DETAIL_ENDPOINT}?batchCode=${encodeURIComponent(batchCode)}`,
      {},
    );
  },

  deleteByBatch(batchCode: string): Promise<void> {
    return httpClient.delete<void>(SAVE_ENDPOINT, {
      params: { batchCode },
    });
  },

  // Takes one employee out of a batch that hasn't been posted yet, so just their days can be
  // calculated again. Refused server-side for a posted batch or days payroll already paid.
  deleteEmployeeFromBatch(
    batchCode: string,
    employeeId: string,
  ): Promise<void> {
    return httpClient.delete<void>(`${SAVE_ENDPOINT}/employee`, {
      params: { batchCode, employeeId },
    });
  },

  // Approve/Decline route through the shared Dtr approval engine instance (started at Save
  // Draft time) rather than posting directly — see DailyRecordService.ApproveBatchAsync /
  // DeclineBatchAsync. batchId is the DTRBatch header row's own id (BatchesModel.id).
  approveBatch(batchId: string, note?: string): Promise<void> {
    return httpClient.post<void>(`${BATCH_ENDPOINT}/${batchId}/approve`, {
      note,
    });
  },

  declineBatch(batchId: string, note?: string): Promise<void> {
    return httpClient.post<void>(`${BATCH_ENDPOINT}/${batchId}/decline`, {
      note,
    });
  },

  // An already-posted batch can't be deleted outright — this starts a separate DtrDeletion
  // approval instance instead. See DailyRecordService.RequestDeletionAsync/ApproveDeletionAsync/
  // DeclineDeletionAsync.
  requestDeletion(batchId: string): Promise<void> {
    return httpClient.post<void>(
      `${BATCH_ENDPOINT}/${batchId}/request-deletion`,
      null,
    );
  },

  approveDeletion(batchId: string, note?: string): Promise<void> {
    return httpClient.post<void>(
      `${BATCH_ENDPOINT}/${batchId}/approve-deletion`,
      { note },
    );
  },

  declineDeletion(batchId: string, note?: string): Promise<void> {
    return httpClient.post<void>(
      `${BATCH_ENDPOINT}/${batchId}/decline-deletion`,
      { note },
    );
  },
};
