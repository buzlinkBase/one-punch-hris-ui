import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ChangeHolidayResponse } from "../models/api/response/change-holiday-response.model";
import type { CreateChangeHoliday } from "../models/api/request/create-change-holiday.model";
import type { UpdateChangeHoliday } from "../models/api/request/update-change-holiday.model";
import type { ChangeHolidayFilter } from "../models/api/request/change-holiday-filter.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "changeholidays");

const HOLIDAY_NAMES = [
  "New Year's Day",
  "Araw ng Kagitingan",
  "Labor Day",
  "Independence Day",
  "National Heroes Day",
  "Bonifacio Day",
  "Christmas Day",
  "Rizal Day",
];

const CLIENT_NAMES = ["Client A", "Client B", "Client C"];

const EMPLOYEE_NAMES = [
  "Santos, Juan",
  "Reyes, Maria",
  "Cruz, Jose",
  "Garcia, Ana",
  "Ramos, Pedro",
  "Torres, Rosa",
  "Flores, Carlos",
  "Mendoza, Luz",
  "Castillo, Ramon",
  "Villanueva, Liza",
];

const MOCK_DATA: ChangeHolidayResponse[] = Array.from(
  { length: 20 },
  (_, i) => ({
    batchId: `ch-${i + 1}`,
    fullName: EMPLOYEE_NAMES[i % EMPLOYEE_NAMES.length],
    holidayName: HOLIDAY_NAMES[i % HOLIDAY_NAMES.length],
    clientName: CLIENT_NAMES[i % CLIENT_NAMES.length],
    fromDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-01`,
    toDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-28`,
  }),
);

function applyFilter(
  data: ChangeHolidayResponse[],
  filter: ChangeHolidayFilter,
): ChangeHolidayResponse[] {
  return data.filter((item) => {
    if (filter.fromPayrollDate && item.fromDate < filter.fromPayrollDate)
      return false;
    if (filter.toPayrollDate && item.toDate > filter.toPayrollDate)
      return false;
    return true;
  });
}

export const changeHolidayApi = {
  async getAll(
    filter: ChangeHolidayFilter = {},
  ): Promise<ChangeHolidayResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<ChangeHolidayResponse[]>(
        ENDPOINT,
        { params: filter },
      );
      const result = data.length ? data : MOCK_DATA;
      return applyFilter(result, filter);
    } catch {
      return applyFilter(MOCK_DATA, filter);
    }
  },

  async getById(id: string): Promise<ChangeHolidayResponse> {
    try {
      return await httpClient.getUnwrapped<ChangeHolidayResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_DATA.find((item) => item.batchId === id);
      if (match) return match;
      throw new Error(`Change Holiday record ${id} not found`);
    }
  },

  create(data: CreateChangeHoliday): Promise<ChangeHolidayResponse> {
    return httpClient.postUnwrapped<ChangeHolidayResponse>(ENDPOINT, data);
  },

  update(data: UpdateChangeHoliday): Promise<ChangeHolidayResponse> {
    return httpClient.put<ChangeHolidayResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
