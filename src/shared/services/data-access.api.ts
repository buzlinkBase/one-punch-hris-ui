import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DataAccessResponse } from "../types/data-access.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "me/data-access");

export const dataAccessApi = {
  get(): Promise<DataAccessResponse> {
    return httpClient.getUnwrapped<DataAccessResponse>(ENDPOINT);
  },
};
