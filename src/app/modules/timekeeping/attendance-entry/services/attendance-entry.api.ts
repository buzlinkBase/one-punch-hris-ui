import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { AttendanceEntryFilter } from "../models/api/request/attendance-entry-filter.model";
import type { EmployeeFilter } from "../models/api/request/employee-filter.model";
import type { CreateAttendanceEntry } from "../models/api/request/create-attendance-entry.model";
import type { UpdateAttendanceEntry } from "../models/api/request/update-attendance-entry.model";
import type { AttendanceEntryResponse } from "../models/api/response/attendance-entry-response.model";
import type { EmployeeFilterResponse } from "../models/api/response/employee-filter-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "attendance");
const ENDPOINT_EMPLOYEE_FILTER = buildApiUrl(
  API_PREFIX.hrms,
  "employees/filter",
);

interface ServerAttendanceRecord {
  id: string;
  employeeId: string | null;
  name: string | null;
  workDateTime: string;
  batch: string;
  logSource: string;
  branch: string | null;
  client: string | null;
  area: string | null;
}

function mapRecord(r: ServerAttendanceRecord): AttendanceEntryResponse {
  return {
    id: r.id,
    employeeId: r.employeeId ?? null,
    employeeName: r.name ?? null,
    timeLog: r.workDateTime,
    batchCode: r.batch || null,
    logSource: r.logSource,
    branch: r.branch ?? null,
    client: r.client ?? null,
    area: r.area ?? null,
  };
}

export const attendanceEntryApi = {
  async getDtrViewLogs(
    filter: AttendanceEntryFilter = {},
  ): Promise<AttendanceEntryResponse[]> {
    const params: Record<string, string> = {};
    if (filter.fromDate) params.fromDate = filter.fromDate;
    if (filter.toDate) params.toDate = filter.toDate;
    if (filter.employeeId) params.employeeId = filter.employeeId;

    try {
      const raw = await httpClient.getUnwrapped<ServerAttendanceRecord[]>(
        `${ENDPOINT}/dtr-view-att`,
        { params },
      );
      return raw.map(mapRecord);
    } catch {
      return [];
    }
  },

  async getAll(
    filter: AttendanceEntryFilter = {},
  ): Promise<AttendanceEntryResponse[]> {
    const params: Record<string, string> = {};
    if (filter.fromDate) params.fromDate = filter.fromDate;
    if (filter.toDate) params.toDate = filter.toDate;
    if (filter.employeeId) params.employeeId = filter.employeeId;

    try {
      const raw = await httpClient.getUnwrapped<ServerAttendanceRecord[]>(
        `${ENDPOINT}/generate`,
        { params },
      );
      return raw.map(mapRecord);
    } catch {
      return [];
    }
  },

  async update(payload: UpdateAttendanceEntry): Promise<void> {
    await httpClient.put<void>(ENDPOINT, payload);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete<void>(`${ENDPOINT}/${id}`, { data: id });
  },

  async deleteBatch(batchCode: string): Promise<void> {
    await httpClient.delete<void>(`${ENDPOINT}/batch/${batchCode}`, {
      data: batchCode,
    });
  },

  async filterEmployees(
    filter: EmployeeFilter = {},
  ): Promise<EmployeeFilterResponse[]> {
    try {
      const params: Record<string, string> = {};
      if (filter.departmentId) params.departmentId = filter.departmentId;
      if (filter.payrollGroupId) params.payrollGroupId = filter.payrollGroupId;
      if (filter.clientId) params.clientId = filter.clientId;
      if (filter.branchId) params.branchId = filter.branchId;
      if (filter.operationAreaId)
        params.operationAreaId = filter.operationAreaId;
      if (filter.dayName != null) params.dayName = String(filter.dayName);

      return await httpClient.getUnwrapped<EmployeeFilterResponse[]>(
        ENDPOINT_EMPLOYEE_FILTER,
        { params },
      );
    } catch {
      return [];
    }
  },

  async create(entries: CreateAttendanceEntry[]): Promise<void> {
    await httpClient.post<void>(`${ENDPOINT}/manual-entry`, entries);
  },
};
