import httpClient from "@/core/http/http-client";
import type { UploadAttendanceFilter } from "../models/api/request/upload-attendance-filter.model";
import type { UploadAttendanceResponse } from "../models/api/response/upload-attendance-response.model";

const ENDPOINT = "timekeeping/upload-attendance";

const EMPLOYEES = Array.from({ length: 20 }, (_, i) => ({
  id: `emp-${1001 + i}`,
  name: `Employee ${i + 1}`,
}));

const createMockLogs = (): UploadAttendanceResponse[] => {
  const logs: UploadAttendanceResponse[] = [];

  for (let i = 0; i < 36; i += 1) {
    const employee = EMPLOYEES[i % EMPLOYEES.length];
    const day = (i % 27) + 1;
    const hour = 8 + (i % 4);

    logs.push({
      id: `ua-${i + 1}`,
      employeeId: employee.id,
      employeeName: employee.name,
      timeLog: `2026-05-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00.000Z`,
      source: "SYSTEM",
    });
  }

  return logs;
};

let mockLogs = createMockLogs();

function applyFilter(
  records: UploadAttendanceResponse[],
  filter: UploadAttendanceFilter,
): UploadAttendanceResponse[] {
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

function parseRawLogsFromFile(file: File): UploadAttendanceResponse[] {
  const nowIso = new Date().toISOString();
  const entries = EMPLOYEES.slice(0, 8).map((employee, index) => ({
    id: `ua-upload-${Date.now()}-${index + 1}`,
    employeeId: employee.id,
    employeeName: employee.name,
    timeLog: nowIso,
    source: "UPLOADED" as const,
  }));

  // Include file name in the generated IDs so each upload is traceable in mock mode.
  return entries.map((entry, idx) => ({
    ...entry,
    id: `${entry.id}-${file.name.replace(/\W+/g, "-").toLowerCase()}-${idx}`,
  }));
}

export const uploadAttendanceApi = {
  async getAll(
    filter: UploadAttendanceFilter = {},
  ): Promise<UploadAttendanceResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<UploadAttendanceResponse[]>(
        ENDPOINT,
        { params: filter },
      );

      const result = data.length ? data : mockLogs;
      return applyFilter(result, filter);
    } catch {
      return applyFilter(mockLogs, filter);
    }
  },

  async uploadRawLog(file: File): Promise<UploadAttendanceResponse[]> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      return await httpClient.postUnwrapped<UploadAttendanceResponse[]>(
        `${ENDPOINT}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    } catch {
      const parsed = parseRawLogsFromFile(file);
      mockLogs = [...parsed, ...mockLogs];
      return parsed;
    }
  },

  getEmployees(): Array<{ value: string; label: string }> {
    return EMPLOYEES.map((employee) => ({
      value: employee.id,
      label: employee.name,
    }));
  },
};
