import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DeductionTypeResponse } from "../models/api/response/deduction-type-response.model";
import type { CreateDeductionType } from "../models/api/request/create-deduction-type.model";
import type { UpdateDeductionType } from "../models/api/request/update-deduction-type.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "deductiontypes");

export const deductionTypeApi = {
  async getAll(): Promise<DeductionTypeResponse[]> {
    return httpClient.getUnwrapped<DeductionTypeResponse[]>(ENDPOINT);
  },

  async getById(id: string): Promise<DeductionTypeResponse> {
    return httpClient.getUnwrapped<DeductionTypeResponse>(`${ENDPOINT}/${id}`);
  },

  create(data: CreateDeductionType): Promise<DeductionTypeResponse> {
    return httpClient.postUnwrapped<DeductionTypeResponse>(ENDPOINT, data);
  },

  update(data: UpdateDeductionType): Promise<DeductionTypeResponse> {
    return httpClient.put<DeductionTypeResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
