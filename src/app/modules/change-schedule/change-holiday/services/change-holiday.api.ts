import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ChangeHolidayResponse } from "../models/api/response/change-holiday-response.model";
import type { CreateChangeHoliday } from "../models/api/request/create-change-holiday.model";
import type { UpdateChangeHoliday } from "../models/api/request/update-change-holiday.model";
import type { ChangeHolidayFilter } from "../models/api/request/change-holiday-filter.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "changeholidays");

export const changeHolidayApi = {
  async getAll(
    filter: ChangeHolidayFilter = {},
  ): Promise<ChangeHolidayResponse[]> {
    try {
      return await httpClient.getUnwrapped<ChangeHolidayResponse[]>(ENDPOINT, {
        params: filter,
      });
    } catch {
      return [];
    }
  },

  getById(id: string): Promise<ChangeHolidayResponse> {
    return httpClient.getUnwrapped<ChangeHolidayResponse>(`${ENDPOINT}/${id}`);
  },

  create(data: CreateChangeHoliday): Promise<void> {
    return httpClient.postUnwrapped<void>(ENDPOINT, data);
  },

  update({ id, ...data }: UpdateChangeHoliday): Promise<void> {
    return httpClient.put<void>(`${ENDPOINT}/${id}`, data);
  },

  removeEmployee(employeeId: string, batchCode: string): Promise<void> {
    return httpClient.delete<void>(ENDPOINT, {
      params: { employeeId, BatchCode: batchCode },
    });
  },

  removeBatch(batchCode: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/batch`, {
      params: { BatchCode: batchCode },
    });
  },
};
