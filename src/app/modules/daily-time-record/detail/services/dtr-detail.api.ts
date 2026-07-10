import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DtrDetailResponse } from "../models/api/response/dtr-detail-response.model";
import type { DtrDetailFilter } from "../models/api/request/dtr-detail-filter.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/dtr-detail");

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
};
