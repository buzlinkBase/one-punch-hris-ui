import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { RosterResponse } from "../models/api/response/roster-response.model";
import type { RosterFilter } from "../models/api/request/roster-filter.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/roster-report");

export const rosterApi = {
  async getAll(filter: RosterFilter = {}): Promise<RosterResponse[]> {
    const data = await httpClient.getUnwrapped<RosterResponse[]>(ENDPOINT, {
      params: filter,
    });
    return data ?? [];
  },
};
