import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ChangeRestDayResponse } from "../models/api/response/change-rest-day-response.model";
import type { CreateChangeRestDay } from "../models/api/request/create-change-rest-day.model";
import type { UpdateChangeRestDay } from "../models/api/request/update-change-rest-day.model";
import type { ChangeRestDayFilter } from "../models/api/request/change-rest-day-filter.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "changerestdays");

export const changeRestDayApi = {
  async getAll(
    filter: ChangeRestDayFilter = {},
  ): Promise<ChangeRestDayResponse[]> {
    try {
      return await httpClient.getUnwrapped<ChangeRestDayResponse[]>(ENDPOINT, {
        params: filter,
      });
    } catch {
      return [];
    }
  },

  getById(id: string): Promise<ChangeRestDayResponse> {
    return httpClient.getUnwrapped<ChangeRestDayResponse>(`${ENDPOINT}/${id}`);
  },

  create(data: CreateChangeRestDay): Promise<void> {
    return httpClient.postUnwrapped<void>(ENDPOINT, data);
  },

  update({ id, ...data }: UpdateChangeRestDay): Promise<void> {
    return httpClient.put<void>(`${ENDPOINT}/${id}`, data);
  },

  removeEmployee(employeeId: string, batchCode: string): Promise<void> {
    return httpClient.delete<void>(ENDPOINT, {
      params: { employeeId, batchCode },
    });
  },

  removeBatch(batchCode: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/batch`, {
      params: { batchCode },
    });
  },
};
