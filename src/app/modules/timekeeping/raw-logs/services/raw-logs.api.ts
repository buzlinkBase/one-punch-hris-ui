import httpClient from "@/core/http/http-client";
import type {
  RawAttendanceLog,
  RawColumnarAttendanceLog,
  CleanAttendanceLogRow,
  CleanAttendanceLogColumnar,
  RawLogsFilterRequest,
  RawLogsResponse,
} from "../models/api/response/raw-attendance-log.model";

const ENDPOINT = "timekeeping/raw-logs";

// Mock data generation
const generateMockRawLogs = (): RawAttendanceLog[] => {
  const logs: RawAttendanceLog[] = [];
  for (let i = 0; i < 50; i++) {
    logs.push({
      id: `raw-${i}`,
      bioId: `BIO-${String(i + 1).padStart(4, "0")}`,
      employeeNo: `EMP-${String(i + 1).padStart(4, "0")}`,
      employeeName: `Employee ${i + 1}`,
      timeLog: `${String((i % 8) + 6).padStart(2, "0")}:${String((i % 60) * 10).padStart(2, "0")}`,
      logType: i % 2 === 0 ? "IN" : "OUT",
      logDateTime: new Date(
        Date.now() - Math.random() * 86400000,
      ).toISOString(),
    });
  }
  return logs;
};

const generateMockColumnarLogs = (): RawColumnarAttendanceLog[] => {
  const logs: RawColumnarAttendanceLog[] = [];
  for (let i = 0; i < 20; i++) {
    const logEntries = [];
    for (let j = 0; j < 15; j++) {
      logEntries.push(
        `${String((j % 2) * 12 + 6 + Math.floor(j / 2)).padStart(2, "0")}:${String((j * 4) % 60).padStart(2, "0")}`,
      );
    }
    logs.push({
      id: `columnar-${i}`,
      bioId: `BIO-${String(i + 1).padStart(4, "0")}`,
      employeeNo: `EMP-${String(i + 1).padStart(4, "0")}`,
      employeeName: `Employee ${i + 1}`,
      department: `Dept-${(i % 5) + 1}`,
      payrollDate: new Date(Date.now() - i * 86400000)
        .toISOString()
        .split("T")[0],
      timeShiftInfo: {
        shiftName: `Shift ${(i % 3) + 1}`,
        shiftStart: "06:00",
        breakOut: "12:00",
        breakIn: "13:00",
        shiftEnd: "18:00",
      },
      logs: logEntries,
    });
  }
  return logs;
};

const generateMockCleanRowLogs = (): CleanAttendanceLogRow[] => {
  const logs: CleanAttendanceLogRow[] = [];
  for (let i = 0; i < 25; i++) {
    logs.push({
      id: `clean-row-${i}`,
      employeeNo: `EMP-${String(i + 1).padStart(4, "0")}`,
      employeeName: `Employee ${i + 1}`,
      department: `Dept-${(i % 5) + 1}`,
      payrollDate: new Date(Date.now() - i * 86400000)
        .toISOString()
        .split("T")[0],
      timeShiftInfo: {
        shiftName: `Shift ${(i % 3) + 1}`,
        shiftStart: "06:00",
        breakOut: "12:00",
        breakIn: "13:00",
        shiftEnd: "18:00",
      },
      log: `${String((i % 8) + 6).padStart(2, "0")}:${String((i % 60) * 10).padStart(2, "0")}`,
      status: ["COMPLETE", "INCOMPLETE", "FLAGGED"][i % 3] as
        | "COMPLETE"
        | "INCOMPLETE"
        | "FLAGGED",
    });
  }
  return logs;
};

const generateMockCleanColumnarLogs = (): CleanAttendanceLogColumnar[] => {
  const logs: CleanAttendanceLogColumnar[] = [];
  for (let i = 0; i < 20; i++) {
    const logEntries = [];
    for (let j = 0; j < 8; j++) {
      logEntries.push(
        `${String((j % 2) * 12 + 6 + Math.floor(j / 2)).padStart(2, "0")}:${String((j * 7) % 60).padStart(2, "0")}`,
      );
    }
    logs.push({
      id: `clean-columnar-${i}`,
      employeeNo: `EMP-${String(i + 1).padStart(4, "0")}`,
      employeeName: `Employee ${i + 1}`,
      department: `Dept-${(i % 5) + 1}`,
      payrollDate: new Date(Date.now() - i * 86400000)
        .toISOString()
        .split("T")[0],
      timeShiftInfo: {
        shiftName: `Shift ${(i % 3) + 1}`,
        shiftStart: "06:00",
        breakOut: "12:00",
        breakIn: "13:00",
        shiftEnd: "18:00",
      },
      logs: logEntries,
      status: ["COMPLETE", "INCOMPLETE", "FLAGGED"][i % 3] as
        | "COMPLETE"
        | "INCOMPLETE"
        | "FLAGGED",
    });
  }
  return logs;
};

const MOCK_DATA: RawLogsResponse = {
  rawAttendanceLogs: generateMockRawLogs(),
  rawColumnarLogs: generateMockColumnarLogs(),
  cleanRowLogs: generateMockCleanRowLogs(),
  cleanColumnarLogs: generateMockCleanColumnarLogs(),
};

export const rawLogsApi = {
  async getAll(filters?: RawLogsFilterRequest): Promise<RawLogsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append("fromDate", filters.fromDate);
      if (filters?.toDate) params.append("toDate", filters.toDate);
      if (filters?.clientId) params.append("clientId", filters.clientId);
      if (filters?.employeeId) params.append("employeeId", filters.employeeId);

      const queryString = params.toString();
      const url = queryString ? `${ENDPOINT}?${queryString}` : ENDPOINT;

      const data = await httpClient.getUnwrapped<RawLogsResponse>(url);
      return data;
    } catch {
      return MOCK_DATA;
    }
  },

  async getRawAttendanceLogs(
    filters?: RawLogsFilterRequest,
  ): Promise<RawAttendanceLog[]> {
    const response = await this.getAll(filters);
    return response.rawAttendanceLogs;
  },

  async getRawColumnarLogs(
    filters?: RawLogsFilterRequest,
  ): Promise<RawColumnarAttendanceLog[]> {
    const response = await this.getAll(filters);
    return response.rawColumnarLogs;
  },

  async getCleanRowLogs(
    filters?: RawLogsFilterRequest,
  ): Promise<CleanAttendanceLogRow[]> {
    const response = await this.getAll(filters);
    return response.cleanRowLogs;
  },

  async getCleanColumnarLogs(
    filters?: RawLogsFilterRequest,
  ): Promise<CleanAttendanceLogColumnar[]> {
    const response = await this.getAll(filters);
    return response.cleanColumnarLogs;
  },
};
