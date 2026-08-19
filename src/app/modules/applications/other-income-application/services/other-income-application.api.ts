import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { OtherIncomeApplicationResponse } from "../models/api/response/other-income-application-response.model";
import type { CreateOtherIncomeApplication } from "../models/api/request/create-other-income-application.model";
import type { UpdateOtherIncomeApplication } from "../models/api/request/update-other-income-application.model";

const ENDPOINT = buildApiUrl(
  API_PREFIX.hrms,
  "OtherIncomeApplicationApplications",
);

export const otherIncomeApplicationApi = {
  getAll(): Promise<OtherIncomeApplicationResponse[]> {
    return httpClient.getUnwrapped<OtherIncomeApplicationResponse[]>(ENDPOINT);
  },

  getById(id: string): Promise<OtherIncomeApplicationResponse> {
    return httpClient.getUnwrapped<OtherIncomeApplicationResponse>(
      `${ENDPOINT}/${id}`,
    );
  },

  create(
    data: CreateOtherIncomeApplication,
  ): Promise<OtherIncomeApplicationResponse> {
    return httpClient.postUnwrapped<OtherIncomeApplicationResponse>(
      ENDPOINT,
      data,
    );
  },

  update(
    data: UpdateOtherIncomeApplication,
  ): Promise<OtherIncomeApplicationResponse> {
    return httpClient.putUnwrapped<OtherIncomeApplicationResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },

  removeScheduleItem(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/item/${id}`);
  },
};
