import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { YearLockResponse } from "../models/api/response/year-lock.model";

const YEAR_LOCK_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "YearLocks");

export const yearLockApi = {
  getAll(): Promise<YearLockResponse[]> {
    return httpClient.getUnwrapped<YearLockResponse[]>(YEAR_LOCK_ENDPOINT);
  },
  reopen(year: number): Promise<void> {
    return httpClient.post<void>(`${YEAR_LOCK_ENDPOINT}/${year}/reopen`, null);
  },
};
