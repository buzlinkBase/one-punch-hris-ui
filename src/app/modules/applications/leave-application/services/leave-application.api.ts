import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { LeaveApplicationResponse } from "../models/api/response/leave-application-response.model";
import type { CreateLeaveApplication } from "../models/api/request/create-leave-application.model";
import type { UpdateLeaveApplication } from "../models/api/request/update-leave-application.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "leaveapplications");

export const leaveApplicationApi = {
  async getAll(): Promise<LeaveApplicationResponse[]> {
    return httpClient.getUnwrapped<LeaveApplicationResponse[]>(ENDPOINT);
  },

  async getById(id: string): Promise<LeaveApplicationResponse> {
    return httpClient.getUnwrapped<LeaveApplicationResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(data: CreateLeaveApplication): Promise<LeaveApplicationResponse> {
    return httpClient.postUnwrapped<LeaveApplicationResponse>(ENDPOINT, data);
  },

  update(data: UpdateLeaveApplication): Promise<LeaveApplicationResponse> {
    return httpClient.put<LeaveApplicationResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
