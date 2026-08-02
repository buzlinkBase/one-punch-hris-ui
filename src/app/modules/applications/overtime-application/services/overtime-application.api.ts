import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { OvertimeApplicationResponse } from "../models/api/response/overtime-application-response.model";
import type { CreateOvertimeApplication } from "../models/api/request/create-overtime-application.model";
import type { UpdateOvertimeApplication } from "../models/api/request/update-overtime-application.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "overtimeapplications");

export const overtimeApplicationApi = {
  async getAll(): Promise<OvertimeApplicationResponse[]> {
    return httpClient.getUnwrapped<OvertimeApplicationResponse[]>(ENDPOINT);
  },

  async getById(id: string): Promise<OvertimeApplicationResponse> {
    return httpClient.getUnwrapped<OvertimeApplicationResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(
    data: CreateOvertimeApplication,
  ): Promise<OvertimeApplicationResponse> {
    return httpClient.postUnwrapped<OvertimeApplicationResponse>(
      ENDPOINT,
      data,
    );
  },

  update(
    data: UpdateOvertimeApplication,
  ): Promise<OvertimeApplicationResponse> {
    return httpClient.put<OvertimeApplicationResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
