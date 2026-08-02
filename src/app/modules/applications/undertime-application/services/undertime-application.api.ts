import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { UndertimeApplicationResponse } from "../models/api/response/undertime-application-response.model";
import type { CreateUndertimeApplication } from "../models/api/request/create-undertime-application.model";
import type { UpdateUndertimeApplication } from "../models/api/request/update-undertime-application.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "undertimeapplications");

export const undertimeApi = {
  async getAll(): Promise<UndertimeApplicationResponse[]> {
    return httpClient.getUnwrapped<UndertimeApplicationResponse[]>(ENDPOINT);
  },

  async getById(id: string): Promise<UndertimeApplicationResponse> {
    return httpClient.getUnwrapped<UndertimeApplicationResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(
    data: CreateUndertimeApplication,
  ): Promise<UndertimeApplicationResponse> {
    return httpClient.postUnwrapped<UndertimeApplicationResponse>(
      ENDPOINT,
      data,
    );
  },

  update(
    data: UpdateUndertimeApplication,
  ): Promise<UndertimeApplicationResponse> {
    return httpClient.put<UndertimeApplicationResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
