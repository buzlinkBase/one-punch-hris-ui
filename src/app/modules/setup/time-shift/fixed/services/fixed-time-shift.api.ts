import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { FixedTimeShiftResponse } from "../models/api/response/fixed-time-shift-response.model";
import type { CreateFixedTimeShift } from "../models/api/request/create-fixed-time-shift.model";
import type { UpdateFixedTimeShift } from "../models/api/request/update-fixed-time-shift.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "timeshifts");

export const fixedTimeShiftApi = {
  getAll(): Promise<FixedTimeShiftResponse[]> {
    return httpClient.getUnwrapped<FixedTimeShiftResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<FixedTimeShiftResponse> {
    return httpClient.getUnwrapped<FixedTimeShiftResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreateFixedTimeShift): Promise<FixedTimeShiftResponse> {
    return httpClient.postUnwrapped<FixedTimeShiftResponse>(ENDPOINT, data);
  },
  update(data: UpdateFixedTimeShift): Promise<FixedTimeShiftResponse> {
    return httpClient.put<FixedTimeShiftResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
