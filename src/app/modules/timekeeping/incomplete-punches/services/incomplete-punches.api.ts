import httpClient from "@/core/http/http-client";
import type {
  IncompletePunch,
  IncompletePunchesFilterRequest,
  IncompletePunchesResponse,
} from "../models/api/response/incomplete-punch.model";

const ENDPOINT = "timekeeping/incomplete-punches";

const generateMockIncompletePunches = (): IncompletePunch[] => {
  const statuses: IncompletePunch["status"][] = [
    "MISSING_IN",
    "MISSING_OUT",
    "PARTIAL",
    "MULTIPLE_GAPS",
  ];

  const punches: IncompletePunch[] = [];

  for (let i = 0; i < 35; i++) {
    const missingCount = Math.floor(Math.random() * 3) + 1;
    const totalLogs = Math.floor(Math.random() * 15) + 5;
    const logs = [];

    for (let j = 0; j < totalLogs; j++) {
      logs.push(
        `${String((j % 2) * 12 + 6 + Math.floor(j / 2)).padStart(2, "0")}:${String((j * 3) % 60).padStart(2, "0")}`,
      );
    }

    punches.push({
      id: `incomplete-${i}`,
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
      logs,
      missingLogs: missingCount,
      status: statuses[i % statuses.length],
    });
  }

  return punches;
};

const MOCK_DATA: IncompletePunchesResponse = (() => {
  const incompletePunches = generateMockIncompletePunches();
  return {
    incompletePunches,
    totalCount: incompletePunches.length,
    filteredCount: incompletePunches.length,
  };
})();

export const incompletePunchesApi = {
  async getAll(
    filters?: IncompletePunchesFilterRequest,
  ): Promise<IncompletePunchesResponse> {
    try {
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

      const data =
        await httpClient.getUnwrapped<IncompletePunchesResponse>(url);
      return data;
    } catch {
      return MOCK_DATA;
    }
  },

  async getById(id: string): Promise<IncompletePunch> {
    try {
      return await httpClient.getUnwrapped<IncompletePunch>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_DATA.incompletePunches.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Incomplete punch ${id} not found`);
    }
  },
};
