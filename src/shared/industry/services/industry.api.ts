import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { Industry } from "../models/industry.model";

const ENDPOINT = buildApiUrl(API_PREFIX.tenants, "industries");

export const industryApi = {
  async getAll(): Promise<Industry[]> {
    return httpClient.getUnwrapped<Industry[]>(ENDPOINT);
  },
};
