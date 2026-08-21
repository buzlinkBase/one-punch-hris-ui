import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { OtherIncomeResponse } from "../models/api/response/other-income-response.model";
import type { CreateOtherIncome } from "../models/api/request/create-other-income.model";
import type { UpdateOtherIncome } from "../models/api/request/update-other-income.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "OtherIncomes");

export const otherIncomeApi = {
  getAll(): Promise<OtherIncomeResponse[]> {
    return httpClient.getUnwrapped<OtherIncomeResponse[]>(ENDPOINT);
  },

  getById(id: string): Promise<OtherIncomeResponse> {
    return httpClient.getUnwrapped<OtherIncomeResponse>(`${ENDPOINT}/${id}`);
  },

  create(data: CreateOtherIncome): Promise<OtherIncomeResponse> {
    return httpClient.postUnwrapped<OtherIncomeResponse>(ENDPOINT, data);
  },

  update(data: UpdateOtherIncome): Promise<OtherIncomeResponse> {
    return httpClient.putUnwrapped<OtherIncomeResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
