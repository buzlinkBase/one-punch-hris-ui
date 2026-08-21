import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DeductionResponse } from "../models/api/response/deduction-response.model";
import type { CreateDeduction } from "../models/api/request/create-deduction.model";
import type { UpdateDeduction } from "../models/api/request/update-deduction.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "deductions");

export const deductionApi = {
  async getAll(): Promise<DeductionResponse[]> {
    return httpClient.getUnwrapped<DeductionResponse[]>(ENDPOINT);
  },

  async getById(id: string): Promise<DeductionResponse> {
    return httpClient.getUnwrapped<DeductionResponse>(`${ENDPOINT}/${id}`);
  },

  create(data: CreateDeduction): Promise<DeductionResponse> {
    return httpClient.postUnwrapped<DeductionResponse>(ENDPOINT, data);
  },

  update(data: UpdateDeduction): Promise<DeductionResponse> {
    return httpClient.put<DeductionResponse>(`${ENDPOINT}/${data.id}`, data);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
