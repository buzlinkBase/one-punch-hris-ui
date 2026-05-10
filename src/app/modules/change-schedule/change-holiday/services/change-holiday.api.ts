import httpClient from "@/core/http/http-client";
import type { ChangeHolidayResponse } from "../models/api/response/change-holiday-response.model";
import type { CreateChangeHoliday } from "../models/api/request/create-change-holiday.model";
import type { UpdateChangeHoliday } from "../models/api/request/update-change-holiday.model";
import type { ChangeHolidayFilter } from "../models/api/request/change-holiday-filter.model";

const ENDPOINT = "change-schedule/change-holiday";

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

const MOCK_DATA: ChangeHolidayResponse[] = Array.from(
  { length: 20 },
  (_, i) => {
    const targetIndex = i % 3;
    const targetType =
      targetIndex === 0
        ? "employee"
        : targetIndex === 1
          ? "payroll-group"
          : "employee-group";
    const employeeId = `emp-${1001 + i}`;
    const payrollGroupId = `pg-${(i % 4) + 1}`;
    const employeeIds =
      targetType === "employee-group"
        ? [`emp-${1001 + i}`, `emp-${1002 + i}`, `emp-${1003 + i}`]
        : undefined;

    return {
      id: `ch-${i + 1}`,
      targetType,
      employeeId: targetType === "employee" ? employeeId : undefined,
      employeeIds,
      employeeName: targetType === "employee" ? `Employee ${i + 1}` : undefined,
      targetLabel:
        targetType === "employee"
          ? `Employee ${i + 1}`
          : targetType === "payroll-group"
            ? `Payroll Group ${(i % 4) + 1}`
            : `Employee Group (${employeeIds?.length ?? 0})`,
      holidayId: `holiday-${(i % HOLIDAY_NAMES.length) + 1}`,
      holidayName: HOLIDAY_NAMES[i % HOLIDAY_NAMES.length],
      clientId: `client-${(i % 3) + 1}`,
      clientName: CLIENT_NAMES[i % 3],
      payrollGroupId,
      fromDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-01`,
      toDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-28`,
    };
  },
);

function applyFilter(
  data: ChangeHolidayResponse[],
  filter: ChangeHolidayFilter,
): ChangeHolidayResponse[] {
  return data.filter((item) => {
    if (filter.targetType && item.targetType !== filter.targetType)
      return false;
    if (filter.payrollGroupId && item.payrollGroupId !== filter.payrollGroupId)
      return false;
    if (
      filter.employeeId &&
      item.employeeId !== filter.employeeId &&
      !(item.employeeIds ?? []).includes(filter.employeeId)
    ) {
      return false;
    }
    if (filter.clientId && item.clientId !== filter.clientId) return false;
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
      const match = MOCK_DATA.find((item) => item.id === id);
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
