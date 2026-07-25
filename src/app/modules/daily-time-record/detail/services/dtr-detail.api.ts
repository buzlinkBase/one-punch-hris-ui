import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DtrDetailResponse } from "../models/api/response/dtr-detail-response.model";
import type { DtrDetailFilter } from "../models/api/request/dtr-detail-filter.model";
import type { BatchesModel } from "../../summary/models/api/response/batches.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/dtr-detail");
const SAVE_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords");
const BATCH_LIST_ENDPOINT = buildApiUrl(
  API_PREFIX.hrms,
  "dailyrecords/batch-codes",
);
const LOAD_DETAIL_ENDPOINT = buildApiUrl(
  API_PREFIX.hrms,
  "dailyrecords/load-detail",
);

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
  async getAll(filter: DtrDetailFilter = {}): Promise<DtrDetailResponse[]> {
    try {
      return await httpClient.getUnwrapped<DtrDetailResponse[]>(ENDPOINT, {
        params: buildParams(filter),
      });
    } catch {
      return [];
    }
  },

  save(records: DtrDetailResponse[]): Promise<DtrDetailResponse[]> {
    return httpClient.postUnwrapped<DtrDetailResponse[]>(
      SAVE_ENDPOINT,
      records,
    );
  },

  getBatchCodes(): Promise<BatchesModel[]> {
    return httpClient.getUnwrapped<BatchesModel[]>(BATCH_LIST_ENDPOINT);
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
};
