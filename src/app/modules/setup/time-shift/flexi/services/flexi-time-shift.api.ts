import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { FlexiTimeShiftResponse } from "../models/api/response/flexi-time-shift-response.model";
import type { CreateFlexiTimeShift } from "../models/api/request/create-flexi-time-shift.model";
import type { UpdateFlexiTimeShift } from "../models/api/request/update-flexi-time-shift.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "timeshifts");

export const flexiTimeShiftApi = {
  getAll(): Promise<FlexiTimeShiftResponse[]> {
    return httpClient.getUnwrapped<FlexiTimeShiftResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<FlexiTimeShiftResponse> {
    return httpClient.getUnwrapped<FlexiTimeShiftResponse>(`${ENDPOINT}/${id}`);
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
