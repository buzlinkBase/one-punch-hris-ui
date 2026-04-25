import httpClient from "@/core/http/http-client";
import type { HolidayResponse } from "../models/api/response/holiday-response.model";
import type { CreateHoliday } from "../models/api/request/create-holiday.model";
import type { UpdateHoliday } from "../models/api/request/update-holiday.model";

const ENDPOINT = "holidays";

const holidayTypes: HolidayResponse["type"][] = [
  "Regular",
  "Special Non-Working",
  "Special Working",
];

const MOCK_HOLIDAYS: HolidayResponse[] = Array.from({ length: 24 }, (_, i) => ({
  id: `hol-${i + 1}`,
  name: `Holiday ${i + 1}`,
  date: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
  type: holidayTypes[i % holidayTypes.length],
  status: i % 8 === 0 ? "INACTIVE" : "ACTIVE",
}));

export const holidayApi = {
  async getAll(): Promise<HolidayResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<HolidayResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_HOLIDAYS;
    } catch {
      return MOCK_HOLIDAYS;
    }
  },
  async getById(id: string): Promise<HolidayResponse> {
    try {
      return await httpClient.getUnwrapped<HolidayResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_HOLIDAYS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Holiday ${id} not found`);
    }
  },
  create(data: CreateHoliday): Promise<HolidayResponse> {
    return httpClient.postUnwrapped<HolidayResponse>(ENDPOINT, data);
  },
  update(data: UpdateHoliday): Promise<HolidayResponse> {
    return httpClient.put<HolidayResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
