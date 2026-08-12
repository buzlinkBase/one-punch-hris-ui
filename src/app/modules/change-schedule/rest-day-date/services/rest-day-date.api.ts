import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { RestDayDateResponse } from "../models/api/response/rest-day-date-response.model";
import type { CreateRestDayDate } from "../models/api/request/create-rest-day-date.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "restdaydates");

export const restDayDateApi = {
  create(data: CreateRestDayDate): Promise<RestDayDateResponse> {
    return httpClient.postUnwrapped<RestDayDateResponse>(ENDPOINT, data);
  },
};
