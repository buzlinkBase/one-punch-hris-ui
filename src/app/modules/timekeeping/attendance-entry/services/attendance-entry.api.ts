import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { AttendanceEntryFilter } from "../models/api/request/attendance-entry-filter.model";
import type { CreateAttendanceEntry } from "../models/api/request/create-attendance-entry.model";
import type { AttendanceEntryResponse } from "../models/api/response/attendance-entry-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/generate");
const ENDPOINT_MANUAL = buildApiUrl(API_PREFIX.hrms, "attendance/manual-entry");

const EMPLOYEES = Array.from({ length: 20 }, (_, i) => ({
  id: `emp-${1001 + i}`,
  name: `Employee ${i + 1}`,
}));

const createMockLogs = (): AttendanceEntryResponse[] => {
  const logs: AttendanceEntryResponse[] = [];

  for (let i = 0; i < 80; i += 1) {
    const employee = EMPLOYEES[i % EMPLOYEES.length];
    const day = (i % 28) + 1;
    const hour = 6 + (i % 13);
    const minute = i % 2 === 0 ? "00" : "30";

    logs.push({
      id: `ae-${i + 1}`,
      employeeId: employee.id,
      employeeName: employee.name,
      timeLog: `2026-05-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${minute}:00.000Z`,
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

    if (filter.employeeId && item.employeeId !== filter.employeeId) {
      return false;
    }

    if (filter.fromDate && logDate < filter.fromDate) {
      return false;
    }

    if (filter.toDate && logDate > filter.toDate) {
      return false;
    }

    return true;
  });
}

export const attendanceEntryApi = {
  async getAll(
    filter: AttendanceEntryFilter = {},
  ): Promise<AttendanceEntryResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<AttendanceEntryResponse[]>(
        ENDPOINT,
        { params: filter },
      );
      const result = data.length ? data : mockLogs;
      return applyFilter(result, filter);
    } catch {
      return applyFilter(mockLogs, filter);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await httpClient.delete<void>(`${ENDPOINT}/${id}`);
    } catch {
      mockLogs = mockLogs.filter((item) => item.id !== id);
    }
  },

  getEmployees(): Array<{ value: string; label: string }> {
    return EMPLOYEES.map((employee) => ({
      value: employee.id,
      label: employee.name,
    }));
  },

  async create(entries: CreateAttendanceEntry[]): Promise<void> {
    await httpClient.post<void>(ENDPOINT_MANUAL, entries);
  },
};
