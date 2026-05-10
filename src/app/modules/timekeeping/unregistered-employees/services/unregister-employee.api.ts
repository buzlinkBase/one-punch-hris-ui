import httpClient from "@/core/http/http-client";
import type { UnregisterEmployeeFilter } from "../models/api/request/unregister-employee-filter.model";
import type { UnregisterEmployeeResponse } from "../models/api/response/unregister-employee-response.model";

const ENDPOINT = "timekeeping/unregistered-employees";

const departments = ["Operations", "Finance", "Human Resources", "IT"];
const positions = ["Staff", "Supervisor", "Team Lead", "Manager"];

const MOCK_DATA: UnregisterEmployeeResponse[] = Array.from(
  { length: 26 },
  (_, i) => {
    const isRegistered = i % 3 !== 0;
    const day = (i % 27) + 1;

    return {
      id: `ue-${i + 1}`,
      employeeId: `emp-${1001 + i}`,
      employeeNo: `EMP-${1001 + i}`,
      employeeName: `Employee ${i + 1}`,
      department: departments[i % departments.length],
      position: positions[i % positions.length],
      biometricId: isRegistered ? `BIO-${3001 + i}` : null,
      status: isRegistered ? "REGISTERED" : "UNREGISTERED",
      lastActionAt: `2026-05-${String(day).padStart(2, "0")}T08:00:00.000Z`,
    };
  },
);

let mockEmployees = [...MOCK_DATA];

function applyFilter(
  records: UnregisterEmployeeResponse[],
  filter: UnregisterEmployeeFilter,
): UnregisterEmployeeResponse[] {
  return records.filter((item) => {
    const actionDate = item.lastActionAt.slice(0, 10);

    if (filter.fromDate && actionDate < filter.fromDate) {
      return false;
    }

    if (filter.toDate && actionDate > filter.toDate) {
      return false;
    }

    return true;
  });
}

function updateMockStatus(
  employeeId: string,
  nextStatus: "REGISTERED" | "UNREGISTERED",
): UnregisterEmployeeResponse {
  const index = mockEmployees.findIndex(
    (item) => item.employeeId === employeeId,
  );

  if (index < 0) {
    throw new Error(`Employee ${employeeId} not found`);
  }

  const current = mockEmployees[index];
  const updated: UnregisterEmployeeResponse = {
    ...current,
    status: nextStatus,
    biometricId:
      nextStatus === "REGISTERED"
        ? current.biometricId || `BIO-${Date.now()}`
        : null,
    lastActionAt: new Date().toISOString(),
  };

  mockEmployees[index] = updated;
  return updated;
}

export const unregisterEmployeeApi = {
  async getAll(
    filter: UnregisterEmployeeFilter = {},
  ): Promise<UnregisterEmployeeResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<UnregisterEmployeeResponse[]>(
        ENDPOINT,
        { params: filter },
      );

      const result = data.length ? data : mockEmployees;
      return applyFilter(result, filter);
    } catch {
      return applyFilter(mockEmployees, filter);
    }
  },

  async registerEmployee(
    employeeId: string,
  ): Promise<UnregisterEmployeeResponse> {
    try {
      return await httpClient.postUnwrapped<UnregisterEmployeeResponse>(
        `${ENDPOINT}/${employeeId}/register`,
      );
    } catch {
      return updateMockStatus(employeeId, "REGISTERED");
    }
  },

  async unregisterEmployee(
    employeeId: string,
  ): Promise<UnregisterEmployeeResponse> {
    try {
      return await httpClient.postUnwrapped<UnregisterEmployeeResponse>(
        `${ENDPOINT}/${employeeId}/unregister`,
      );
    } catch {
      return updateMockStatus(employeeId, "UNREGISTERED");
    }
  },
};
