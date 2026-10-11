import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  RawAttendanceLog,
  RawColumnarAttendanceLog,
  CleanAttendanceLogRow,
  CleanAttendanceLogColumnar,
  RawLogsFilterRequest,
} from "../models/api/response/raw-attendance-log.model";

const EP_RAW_ATTENDANCE = buildApiUrl(API_PREFIX.hrms, "attendance/raw-logs");
const EP_RAW_COLUMNAR = buildApiUrl(
  API_PREFIX.hrms,
  "dailyrecords/columnar-raw",
);
const EP_CLEAN_ROW = buildApiUrl(API_PREFIX.hrms, "dailyrecords/clean-row");
const EP_CLEAN_COLUMNAR = buildApiUrl(
  API_PREFIX.hrms,
  "dailyrecords/clean-columnar",
);

function buildParams(filters: RawLogsFilterRequest): Record<string, string> {
  const p: Record<string, string> = {};
  if (filters.fromDate) p.fromDate = filters.fromDate;
  if (filters.toDate) p.toDate = filters.toDate;
  if (filters.employeeId) p.employeeId = filters.employeeId;
  if (filters.branchId) p.branchId = filters.branchId;
  if (filters.departmentId) p.departmentId = filters.departmentId;
  if (filters.clientId) p.clientId = filters.clientId;
  if (filters.payrollGroupId) p.payrollGroupId = filters.payrollGroupId;
  if (filters.operationAreaId) p.operationAreaId = filters.operationAreaId;
  return p;
}

// Failures propagate (the error interceptor already toasts them): returning [] made a failed
// Generate look like "no logs for this range" and was cached as a success.
export const rawLogsApi = {
  getRawAttendanceLogs(
    filters: RawLogsFilterRequest = {},
  ): Promise<RawAttendanceLog[]> {
    return httpClient.getUnwrapped<RawAttendanceLog[]>(EP_RAW_ATTENDANCE, {
      params: buildParams(filters),
    });
  },

  getRawColumnarLogs(
    filters: RawLogsFilterRequest = {},
  ): Promise<RawColumnarAttendanceLog[]> {
    return httpClient.getUnwrapped<RawColumnarAttendanceLog[]>(
      EP_RAW_COLUMNAR,
      { params: buildParams(filters) },
    );
  },

  async getCleanRowLogs(
    filters: RawLogsFilterRequest = {},
  ): Promise<CleanAttendanceLogRow[]> {
    const data = await httpClient.getUnwrapped<CleanAttendanceLogRow[][]>(
      EP_CLEAN_ROW,
      { params: buildParams(filters) },
    );
    return data.flat();
  },

  getCleanColumnarLogs(
    filters: RawLogsFilterRequest = {},
  ): Promise<CleanAttendanceLogColumnar[]> {
    return httpClient.getUnwrapped<CleanAttendanceLogColumnar[]>(
      EP_CLEAN_COLUMNAR,
      { params: buildParams(filters) },
    );
  },
};
