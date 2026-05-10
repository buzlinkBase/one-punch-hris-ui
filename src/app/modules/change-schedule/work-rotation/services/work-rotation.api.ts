import httpClient from "@/core/http/http-client";
import type { WorkRotationResponse } from "../models/api/response/work-rotation-response.model";
import type { CreateWorkRotation } from "../models/api/request/create-work-rotation.model";
import type { UpdateWorkRotation } from "../models/api/request/update-work-rotation.model";
import type { WorkRotationFilter } from "../models/api/request/work-rotation-filter.model";

const ENDPOINT = "change-schedule/work-rotation";

const TIME_SHIFT_NAMES = [
  "Morning Shift (6AM-3PM)",
  "Day Shift (8AM-5PM)",
  "Mid Shift (10AM-7PM)",
  "Night Shift (10PM-6AM)",
  "Flexi Shift",
];

const CLIENT_NAMES = ["Client A", "Client B", "Client C"];

const MOCK_DATA: WorkRotationResponse[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: `wr-${i + 1}`,
    employeeId: `emp-${1001 + i}`,
    employeeName: `Employee ${i + 1}`,
    payrollGroupId: `pg-${(i % 3) + 1}`,
    clientId: `client-${(i % 3) + 1}`,
    clientName: CLIENT_NAMES[i % 3],
    timeShiftId: `ts-${(i % TIME_SHIFT_NAMES.length) + 1}`,
    timeShiftName: TIME_SHIFT_NAMES[i % TIME_SHIFT_NAMES.length],
    payrollDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
  }),
);

function applyFilter(
  data: WorkRotationResponse[],
  filter: WorkRotationFilter,
): WorkRotationResponse[] {
  return data.filter((item) => {
    if (filter.payrollGroupId && item.payrollGroupId !== filter.payrollGroupId)
      return false;
    if (filter.employeeId && item.employeeId !== filter.employeeId)
      return false;
    if (filter.clientId && item.clientId !== filter.clientId) return false;
    if (filter.fromPayrollDate && item.payrollDate < filter.fromPayrollDate)
      return false;
    if (filter.toPayrollDate && item.payrollDate > filter.toPayrollDate)
      return false;
    return true;
  });
}

export const workRotationApi = {
  async getAll(
    filter: WorkRotationFilter = {},
  ): Promise<WorkRotationResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<WorkRotationResponse[]>(
        ENDPOINT,
        { params: filter },
      );
      const result = data.length ? data : MOCK_DATA;
      return applyFilter(result, filter);
    } catch {
      return applyFilter(MOCK_DATA, filter);
    }
  },

  async getById(id: string): Promise<WorkRotationResponse> {
    try {
      return await httpClient.getUnwrapped<WorkRotationResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_DATA.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Work Rotation record ${id} not found`);
    }
  },

  create(data: CreateWorkRotation): Promise<WorkRotationResponse> {
    return httpClient.postUnwrapped<WorkRotationResponse>(ENDPOINT, data);
  },

  update(data: UpdateWorkRotation): Promise<WorkRotationResponse> {
    return httpClient.put<WorkRotationResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
