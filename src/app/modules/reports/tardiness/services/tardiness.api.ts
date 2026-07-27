import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { TardinessResponse } from "../models/api/response/tardiness-response.model";
import type { TardinessFilter } from "../models/api/request/tardiness-filter.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/tardiness-report");

export const tardinessApi = {
  async getAll(filter: TardinessFilter = {}): Promise<TardinessResponse[]> {
    const data = await httpClient.getUnwrapped<TardinessResponse[]>(ENDPOINT, {
      params: filter,
    });
    return data ?? [];
  },
};
