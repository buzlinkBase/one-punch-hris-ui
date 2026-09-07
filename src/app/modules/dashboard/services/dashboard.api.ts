import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DashboardOverview } from "../models/api/response/dashboard-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dashboard");

export const dashboardApi = {
  getOverview(): Promise<DashboardOverview> {
    return httpClient.getUnwrapped<DashboardOverview>(`${ENDPOINT}/overview`);
  },
};
