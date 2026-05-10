import httpClient from "@/core/http/http-client";
import type { ChangeRestDayResponse } from "../models/api/response/change-rest-day-response.model";
import type { CreateChangeRestDay } from "../models/api/request/create-change-rest-day.model";
import type { UpdateChangeRestDay } from "../models/api/request/update-change-rest-day.model";
import type { ChangeRestDayFilter } from "../models/api/request/change-rest-day-filter.model";

const ENDPOINT = "change-schedule/change-rest-day";

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

const MOCK_DATA: ChangeRestDayResponse[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: `crd-${i + 1}`,
    employeeId: `emp-${1001 + i}`,
    employeeName: `Employee ${i + 1}`,
    holidayName: HOLIDAY_NAMES[i % HOLIDAY_NAMES.length],
    clientId: `client-${(i % 3) + 1}`,
    clientName: CLIENT_NAMES[i % 3],
    payrollGroupId: `pg-${(i % 3) + 1}`,
    fromDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-01`,
    toDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-28`,
  }),
);

function applyFilter(
  data: ChangeRestDayResponse[],
  filter: ChangeRestDayFilter,
): ChangeRestDayResponse[] {
  return data.filter((item) => {
    if (filter.payrollGroupId && item.payrollGroupId !== filter.payrollGroupId)
      return false;
    if (filter.employeeId && item.employeeId !== filter.employeeId)
      return false;
    if (filter.clientId && item.clientId !== filter.clientId) return false;
    if (filter.fromPayrollDate && item.fromDate < filter.fromPayrollDate)
      return false;
    if (filter.toPayrollDate && item.toDate > filter.toPayrollDate)
      return false;
    return true;
  });
}

export const changeRestDayApi = {
  async getAll(
    filter: ChangeRestDayFilter = {},
  ): Promise<ChangeRestDayResponse[]> {
    try {
      const data = await httpClient.getUnwrapped<ChangeRestDayResponse[]>(
        ENDPOINT,
        { params: filter },
      );
      const result = data.length ? data : MOCK_DATA;
      return applyFilter(result, filter);
    } catch {
      return applyFilter(MOCK_DATA, filter);
    }
  },

  async getById(id: string): Promise<ChangeRestDayResponse> {
    try {
      return await httpClient.getUnwrapped<ChangeRestDayResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_DATA.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Change rest day record ${id} not found`);
    }
  },

  create(data: CreateChangeRestDay): Promise<ChangeRestDayResponse> {
    return httpClient.postUnwrapped<ChangeRestDayResponse>(ENDPOINT, data);
  },

  update(data: UpdateChangeRestDay): Promise<ChangeRestDayResponse> {
    return httpClient.put<ChangeRestDayResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
