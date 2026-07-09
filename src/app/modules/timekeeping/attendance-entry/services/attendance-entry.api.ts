import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { AttendanceEntryFilter } from "../models/api/request/attendance-entry-filter.model";
import type { EmployeeFilter } from "../models/api/request/employee-filter.model";
import type { CreateAttendanceEntry } from "../models/api/request/create-attendance-entry.model";
import type { AttendanceEntryResponse } from "../models/api/response/attendance-entry-response.model";
import type { EmployeeFilterResponse } from "../models/api/response/employee-filter-response.model";

// All manual attendance routes live under the attendance controller
const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "attendance");
const ENDPOINT_EMPLOYEE_FILTER = buildApiUrl(API_PREFIX.hrms, "employees/filter");

const EMPLOYEES = Array.from({ length: 20 }, (_, i) => ({
  id: `emp-${1001 + i}`,
  name: `Employee ${i + 1}`,
}));

const MOCK_EMPLOYEE_FILTER: EmployeeFilterResponse[] = EMPLOYEES.map((e) => ({
  id: e.id,
  name: e.name,
  branchId: null,
  branchName: null,
  areaId: null,
  areaName: null,
  clientId: null,
  clientName: null,
  departmentId: null,
  departmentName: null,
  payrollGroupId: null,
  payrollGroupName: null,
}));

const MOCK_BATCHES = [
  { code: "BATCH-20260501-001", employeeRange: [0, 8], dayOffset: 0 },
  { code: "BATCH-20260507-002", employeeRange: [4, 12], dayOffset: 6 },
  { code: "BATCH-20260510-003", employeeRange: [10, 18], dayOffset: 9 },
];

const createMockLogs = (): AttendanceEntryResponse[] => {
  const logs: AttendanceEntryResponse[] = [];
  let id = 1;

  // Batch entries
  for (const batch of MOCK_BATCHES) {
    const [start, end] = batch.employeeRange;
    for (let ei = start; ei < end; ei++) {
      const emp = EMPLOYEES[ei % EMPLOYEES.length];
      const baseDay = 1 + batch.dayOffset;
      // In punch
      logs.push({
        id: `ae-${id++}`,
        employeeId: emp.id,
        employeeName: emp.name,
        timeLog: `2026-05-${String(baseDay).padStart(2, "0")}T08:00:00.000Z`,
        batchCode: batch.code,
      });
      // Out punch
      logs.push({
        id: `ae-${id++}`,
        employeeId: emp.id,
        employeeName: emp.name,
        timeLog: `2026-05-${String(baseDay).padStart(2, "0")}T17:00:00.000Z`,
        batchCode: batch.code,
      });
    }
  }

  // Individual (non-batch) entries
  for (let i = 0; i < 12; i++) {
    const emp = EMPLOYEES[i % EMPLOYEES.length];
    const day = (i % 25) + 1;
    const hour = 6 + (i % 13);
    const minute = i % 2 === 0 ? "00" : "30";
    logs.push({
      id: `ae-${id++}`,
      employeeId: emp.id,
      employeeName: emp.name,
      timeLog: `2026-05-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${minute}:00.000Z`,
      batchCode: null,
    });
  }

  return logs;
};

let mockLogs = createMockLogs();

function applyFilter(
  records: AttendanceEntryResponse[],
  filter: AttendanceEntryFilter,
): AttendanceEntryResponse[] {
  return records.filter((item) => {
    const logDate = item.timeLog.slice(0, 10);
    if (filter.employeeId && item.employeeId !== filter.employeeId) return false;
    if (filter.fromDate && logDate < filter.fromDate) return false;
    if (filter.toDate && logDate > filter.toDate) return false;
    return true;
  });
}

export const attendanceEntryApi = {
  async getAll(
    filter: AttendanceEntryFilter = {},
  ): Promise<AttendanceEntryResponse[]> {
    const params: Record<string, string> = {};
    if (filter.fromDate) params.fromDate = filter.fromDate;
    if (filter.toDate) params.toDate = filter.toDate;
    if (filter.employeeId) params.employeeId = filter.employeeId;

    try {
      const data = await httpClient.getUnwrapped<AttendanceEntryResponse[]>(
        `${ENDPOINT}/generate`,
        { params },
      );
      const result = data.length ? data : mockLogs;
      return applyFilter(result, filter);
    } catch {
      return applyFilter(mockLogs, filter);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      // Route: DELETE attendance/{id:guid}  — id must also be in the request body ([FromBody])
      await httpClient.delete<void>(`${ENDPOINT}/${id}`, { data: id });
    } catch {
      mockLogs = mockLogs.filter((item) => item.id !== id);
    }
  },

  async deleteBatch(batchCode: string): Promise<void> {
    try {
      // Route: DELETE attendance/batch/{batch}  — batchCode must also be in the request body ([FromBody])
      await httpClient.delete<void>(`${ENDPOINT}/batch/${batchCode}`, { data: batchCode });
    } catch {
      mockLogs = mockLogs.filter((item) => item.batchCode !== batchCode);
    }
  },

  getEmployees(): Array<{ value: string; label: string }> {
    return EMPLOYEES.map((employee) => ({
      value: employee.id,
      label: employee.name,
    }));
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
      if (filter.operationAreaId) params.operationAreaId = filter.operationAreaId;

      const data = await httpClient.getUnwrapped<EmployeeFilterResponse[]>(
        ENDPOINT_EMPLOYEE_FILTER,
        { params },
      );
      return data.length ? data : MOCK_EMPLOYEE_FILTER;
    } catch {
      return MOCK_EMPLOYEE_FILTER;
    }
  },

  async create(entries: CreateAttendanceEntry[]): Promise<void> {
    await httpClient.post<void>(`${ENDPOINT}/manual-entry`, entries);
  },
};
