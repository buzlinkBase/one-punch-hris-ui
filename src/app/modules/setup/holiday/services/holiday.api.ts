import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { HolidayResponse } from "../models/api/response/holiday-response.model";
import type { CreateHoliday } from "../models/api/request/create-holiday.model";
import type { UpdateHoliday } from "../models/api/request/update-holiday.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "holidays");

export const holidayApi = {
  getAll(): Promise<HolidayResponse[]> {
    return httpClient.getUnwrapped<HolidayResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<HolidayResponse> {
    return httpClient.getUnwrapped<HolidayResponse>(`${ENDPOINT}/${id}`);
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
