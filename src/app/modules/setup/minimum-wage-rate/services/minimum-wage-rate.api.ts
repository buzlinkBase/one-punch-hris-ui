import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { MinimumWageRateResponse } from "../models/api/response/minimum-wage-rate-response.model";
import type { CreateMinimumWageRate } from "../models/api/request/create-minimum-wage-rate.model";
import type { UpdateMinimumWageRate } from "../models/api/request/update-minimum-wage-rate.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "minimumwagerates");

export const minimumWageRateApi = {
  getAll(): Promise<MinimumWageRateResponse[]> {
    return httpClient.getUnwrapped<MinimumWageRateResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<MinimumWageRateResponse> {
    return httpClient.getUnwrapped<MinimumWageRateResponse>(
      `${ENDPOINT}/${id}`,
    );
  },
  create(data: CreateMinimumWageRate): Promise<MinimumWageRateResponse> {
    return httpClient.postUnwrapped<MinimumWageRateResponse>(ENDPOINT, data);
  },
  update(data: UpdateMinimumWageRate): Promise<MinimumWageRateResponse> {
    return httpClient.put<MinimumWageRateResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
