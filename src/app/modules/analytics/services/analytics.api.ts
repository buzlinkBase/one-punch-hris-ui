import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  AnalyticsArea,
  AnalyticsFilter,
  AnalyticsResult,
} from "../models/analytics.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "analytics");

export const analyticsApi = {
  get(area: AnalyticsArea, filter: AnalyticsFilter): Promise<AnalyticsResult> {
    return httpClient.getUnwrapped<AnalyticsResult>(`${ENDPOINT}/${area}`, {
      params: filter,
    });
  },
};
