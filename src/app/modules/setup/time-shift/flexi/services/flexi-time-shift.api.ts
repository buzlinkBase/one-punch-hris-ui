import httpClient from "@/core/http/http-client";
import type { FlexiTimeShiftResponse } from "../models/api/response/flexi-time-shift-response.model";
import type { CreateFlexiTimeShift } from "../models/api/request/create-flexi-time-shift.model";
import type { UpdateFlexiTimeShift } from "../models/api/request/update-flexi-time-shift.model";

const ENDPOINT = "time-shifts/flexi";

const MOCK_FLEXI_TIME_SHIFTS: FlexiTimeShiftResponse[] = Array.from(
  { length: 24 },
  (_, i) => {
    const coreStart = 9 + (i % 4);
    const coreEnd = coreStart + 4;

    return {
      id: `flx-${i + 1}`,
      code: `FLX${String(i + 1).padStart(3, "0")}`,
      name: `Flexi Shift ${i + 1}`,
      coreTimeStart: `${String(coreStart).padStart(2, "0")}:00`,
      coreTimeEnd: `${String(coreEnd).padStart(2, "0")}:00`,
      workDuration: i % 5 === 0 ? 6 : 8,
      status: i % 8 === 0 ? "INACTIVE" : "ACTIVE",
    };
  },
);

export const flexiTimeShiftApi = {
  async getAll(): Promise<FlexiTimeShiftResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<FlexiTimeShiftResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_FLEXI_TIME_SHIFTS;
    } catch {
      return MOCK_FLEXI_TIME_SHIFTS;
    }
  },
  async getById(id: string): Promise<FlexiTimeShiftResponse> {
    try {
      return await httpClient.getUnwrapped<FlexiTimeShiftResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_FLEXI_TIME_SHIFTS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Flexi time shift ${id} not found`);
    }
  },
  create(data: CreateFlexiTimeShift): Promise<FlexiTimeShiftResponse> {
    return httpClient.postUnwrapped<FlexiTimeShiftResponse>(ENDPOINT, data);
  },
  update(data: UpdateFlexiTimeShift): Promise<FlexiTimeShiftResponse> {
    return httpClient.put<FlexiTimeShiftResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
