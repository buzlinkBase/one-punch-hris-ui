import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { SalaryAdjustmentResponse } from "../models/api/response/salary-adjustment-response.model";
import type {
  CreateSalaryAdjustment,
  UpdateSalaryAdjustment,
} from "../models/api/request/create-salary-adjustment.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "SalaryAdjustmentment");

export const salaryAdjustmentApi = {
  getAll(): Promise<SalaryAdjustmentResponse[]> {
    return httpClient.getUnwrapped<SalaryAdjustmentResponse[]>(ENDPOINT);
  },

  getById(id: string): Promise<SalaryAdjustmentResponse> {
    return httpClient.getUnwrapped<SalaryAdjustmentResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(payload: CreateSalaryAdjustment): Promise<SalaryAdjustmentResponse> {
    return httpClient.postUnwrapped<SalaryAdjustmentResponse>(
      ENDPOINT,
      payload,
    );
  },

  update(
    id: string,
    payload: UpdateSalaryAdjustment,
  ): Promise<SalaryAdjustmentResponse> {
    return httpClient.put<SalaryAdjustmentResponse>(
      `${ENDPOINT}/${id}`,
      payload,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
