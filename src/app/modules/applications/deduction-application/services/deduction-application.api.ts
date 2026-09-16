import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DeductionApplicationResponse } from "../models/api/response/deduction-application-response.model";
import type { CreateDeductionApplication } from "../models/api/request/create-deduction-application.model";
import type { UpdateDeductionApplication } from "../models/api/request/update-deduction-application.model";

const ENDPOINT = buildApiUrl(
  API_PREFIX.hrms,
  "DeductionApplicationsApplications",
);

export const deductionApplicationApi = {
  getAll(): Promise<DeductionApplicationResponse[]> {
    return httpClient.getUnwrapped<DeductionApplicationResponse[]>(ENDPOINT);
  },

  getById(id: string): Promise<DeductionApplicationResponse> {
    return httpClient.getUnwrapped<DeductionApplicationResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(
    data: CreateDeductionApplication,
  ): Promise<DeductionApplicationResponse> {
    return httpClient.postUnwrapped<DeductionApplicationResponse>(
      ENDPOINT,
      data,
    );
  },

  update(
    data: UpdateDeductionApplication,
  ): Promise<DeductionApplicationResponse> {
    return httpClient.putUnwrapped<DeductionApplicationResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },

  removeDetail(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/item/${id}`);
  },

  approve(id: string, note?: string): Promise<void> {
    return httpClient.put<void>(`${ENDPOINT}/${id}/approve`, { note });
  },

  decline(id: string, note?: string): Promise<void> {
    return httpClient.put<void>(`${ENDPOINT}/${id}/decline`, { note });
  },
};
