import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { OtherIncomeTypeResponse } from "../models/api/response/other-income-type-response.model";
import type { CreateOtherIncomeType } from "../models/api/request/create-other-income-type.model";
import type { UpdateOtherIncomeType } from "../models/api/request/update-other-income-type.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "OtherIncomeTypes");

export const otherIncomeTypeApi = {
  getAll(): Promise<OtherIncomeTypeResponse[]> {
    return httpClient.getUnwrapped<OtherIncomeTypeResponse[]>(ENDPOINT);
  },

  getById(id: string): Promise<OtherIncomeTypeResponse> {
    return httpClient.getUnwrapped<OtherIncomeTypeResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(data: CreateOtherIncomeType): Promise<OtherIncomeTypeResponse> {
    return httpClient.postUnwrapped<OtherIncomeTypeResponse>(ENDPOINT, data);
  },

  update(data: UpdateOtherIncomeType): Promise<OtherIncomeTypeResponse> {
    return httpClient.putUnwrapped<OtherIncomeTypeResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
