import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { RestDayDateResponse } from "../models/api/response/rest-day-date-response.model";
import type { CreateRestDayDate } from "../models/api/request/create-rest-day-date.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "restdaydates");

export const restDayDateApi = {
  create(data: CreateRestDayDate): Promise<RestDayDateResponse> {
    return httpClient.postUnwrapped<RestDayDateResponse>(ENDPOINT, data);
  },

  async getAllByEmployee(
    employeeId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<RestDayDateResponse[]> {
    try {
      return await httpClient.getUnwrapped<RestDayDateResponse[]>(ENDPOINT, {
        params: {
          employee_id: employeeId,
          date_from: dateFrom,
          date_to: dateTo,
        },
      });
    } catch {
      return [];
    }
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
