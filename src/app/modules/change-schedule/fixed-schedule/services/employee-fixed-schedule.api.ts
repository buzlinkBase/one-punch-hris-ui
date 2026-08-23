import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  DayName,
  EmployeeFixedScheduleResponse,
} from "../models/api/response/employee-fixed-schedule-response.model";
import type { SetEmployeeFixedScheduleDay } from "../models/api/request/set-employee-fixed-schedule-day.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "EmployeeFixedSchedules");

export const employeeFixedScheduleApi = {
  getByEmployee(employeeId: string): Promise<EmployeeFixedScheduleResponse[]> {
    return httpClient.getUnwrapped<EmployeeFixedScheduleResponse[]>(
      `${ENDPOINT}/employee/${employeeId}`,
    );
  },
  setDay(
    employeeId: string,
    dayName: DayName,
    data: SetEmployeeFixedScheduleDay,
  ): Promise<EmployeeFixedScheduleResponse> {
    return httpClient.put<EmployeeFixedScheduleResponse>(
      `${ENDPOINT}/employee/${employeeId}/day/${dayName}`,
      data,
    );
  },
  unassignDay(employeeId: string, dayName: DayName): Promise<void> {
    return httpClient.delete<void>(
      `${ENDPOINT}/employee/${employeeId}/day/${dayName}`,
    );
  },
};
