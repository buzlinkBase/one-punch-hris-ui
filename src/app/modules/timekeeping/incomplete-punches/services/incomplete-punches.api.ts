import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  IncompletePunch,
  IncompletePunchesFilterRequest,
  IncompletePunchesResponse,
} from "../models/api/response/incomplete-punch.model";
import type {
  CleanAttendanceLogColumnar,
  RawLogsFilterRequest,
} from "@/app/modules/timekeeping/raw-logs/models/api/response/raw-attendance-log.model";

const EP_INCOMPLETE_COLUMNAR = buildApiUrl(
  API_PREFIX.hrms,
  "dailyrecords/incomplete-columnar",
);

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "timekeeping/incomplete-punches");

export const incompletePunchesApi = {
  async getAll(
    filters?: IncompletePunchesFilterRequest,
  ): Promise<IncompletePunchesResponse> {
    const params = new URLSearchParams();
    if (filters?.fromDate) params.append("fromDate", filters.fromDate);
    if (filters?.toDate) params.append("toDate", filters.toDate);
    if (filters?.departmentId)
      params.append("departmentId", filters.departmentId);
    if (filters?.clientId) params.append("clientId", filters.clientId);
    if (filters?.employeeId) params.append("employeeId", filters.employeeId);
    if (filters?.payrollGroupId)
      params.append("payrollGroupId", filters.payrollGroupId);

    const queryString = params.toString();
    const url = queryString ? `${ENDPOINT}?${queryString}` : ENDPOINT;

    return httpClient.getUnwrapped<IncompletePunchesResponse>(url);
  },

  async getById(id: string): Promise<IncompletePunch> {
    return httpClient.getUnwrapped<IncompletePunch>(`${ENDPOINT}/${id}`);
  },

  async getIncompleteColumnar(
    filters: RawLogsFilterRequest = {},
  ): Promise<CleanAttendanceLogColumnar[]> {
    const p: Record<string, string> = {};
    if (filters.fromDate) p.fromDate = filters.fromDate;
    if (filters.toDate) p.toDate = filters.toDate;
    if (filters.employeeId) p.employeeId = filters.employeeId;
    if (filters.branchId) p.branchId = filters.branchId;
    if (filters.departmentId) p.departmentId = filters.departmentId;
    if (filters.clientId) p.clientId = filters.clientId;
    if (filters.payrollGroupId) p.payrollGroupId = filters.payrollGroupId;
    if (filters.operationAreaId) p.operationAreaId = filters.operationAreaId;
    return httpClient.getUnwrapped<CleanAttendanceLogColumnar[]>(
      EP_INCOMPLETE_COLUMNAR,
      { params: p },
    );
  },
};
