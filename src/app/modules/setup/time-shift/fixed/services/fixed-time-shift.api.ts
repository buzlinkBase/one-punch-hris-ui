import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { FixedTimeShiftResponse } from "../models/api/response/fixed-time-shift-response.model";
import type { CreateFixedTimeShift } from "../models/api/request/create-fixed-time-shift.model";
import type { UpdateFixedTimeShift } from "../models/api/request/update-fixed-time-shift.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "timeshifts");

const MOCK_FIXED_TIME_SHIFTS: FixedTimeShiftResponse[] = Array.from(
  { length: 24 },
  (_, i) => {
    const startHour = (6 + (i % 8) * 2) % 24;
    const endHour = (startHour + 9) % 24;

    return {
      id: `fts-${i + 1}`,
      code: `FTS${String(i + 1).padStart(3, "0")}`,
      name: `Fixed Shift ${i + 1}`,
      timeIn: `${String(startHour).padStart(2, "0")}:00`,
      timeOut: `${String(endHour).padStart(2, "0")}:00`,
      breakDuration: i % 3 === 0 ? 90 : 60,
      workDuration: i % 4 === 0 ? 9 : 8,
      status: i % 7 === 0 ? "INACTIVE" : "ACTIVE",
    };
  },
);

export const fixedTimeShiftApi = {
  async getAll(): Promise<FixedTimeShiftResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<FixedTimeShiftResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_FIXED_TIME_SHIFTS;
    } catch {
      return MOCK_FIXED_TIME_SHIFTS;
    }
  },
  async getById(id: string): Promise<FixedTimeShiftResponse> {
    try {
      return await httpClient.getUnwrapped<FixedTimeShiftResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_FIXED_TIME_SHIFTS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Fixed time shift ${id} not found`);
    }
  },
  create(data: CreateFixedTimeShift): Promise<FixedTimeShiftResponse> {
    return httpClient.postUnwrapped<FixedTimeShiftResponse>(ENDPOINT, data);
  },
  update(data: UpdateFixedTimeShift): Promise<FixedTimeShiftResponse> {
    return httpClient.put<FixedTimeShiftResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
