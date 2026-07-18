import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { SplitTimeShiftResponse } from "../models/api/response/split-time-shift-response.model";
import type { CreateSplitTimeShift } from "../models/api/request/create-split-time-shift.model";
import type { UpdateSplitTimeShift } from "../models/api/request/update-split-time-shift.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "timeshifts");

export const SplitTimeShiftApi = {
  getAll(): Promise<SplitTimeShiftResponse[]> {
    return httpClient.getUnwrapped<SplitTimeShiftResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<SplitTimeShiftResponse> {
    return httpClient.getUnwrapped<SplitTimeShiftResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreateSplitTimeShift): Promise<SplitTimeShiftResponse> {
    return httpClient.postUnwrapped<SplitTimeShiftResponse>(ENDPOINT, data);
  },
  update(data: UpdateSplitTimeShift): Promise<SplitTimeShiftResponse> {
    return httpClient.put<SplitTimeShiftResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
