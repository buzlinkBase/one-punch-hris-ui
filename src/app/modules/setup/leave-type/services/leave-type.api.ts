import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { LeaveTypeResponse } from "../models/api/response/leave-type-response.model";
import type { CreateLeaveType } from "../models/api/request/create-leave-type.model";
import type { UpdateLeaveType } from "../models/api/request/update-leave-type.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "leaves");

export const leaveTypeApi = {
  async getAll(): Promise<LeaveTypeResponse[]> {
    return httpClient.getUnwrapped<LeaveTypeResponse[]>(ENDPOINT);
  },

  async getById(id: string): Promise<LeaveTypeResponse> {
    return httpClient.getUnwrapped<LeaveTypeResponse>(`${ENDPOINT}/${id}`);
  },

  create(data: CreateLeaveType): Promise<LeaveTypeResponse> {
    return httpClient.postUnwrapped<LeaveTypeResponse>(ENDPOINT, data);
  },

  update(data: UpdateLeaveType): Promise<LeaveTypeResponse> {
    return httpClient.put<LeaveTypeResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
