import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../services/analytics.api";
import type { AnalyticsArea, AnalyticsFilter } from "../models/analytics.model";

export function useAnalytics(area: AnalyticsArea, filter: AnalyticsFilter) {
  return useQuery({
    queryKey: ["analytics", area, filter],
    queryFn: () => analyticsApi.get(area, filter),
    // Keep the last figures on screen while a filter change loads.
    placeholderData: keepPreviousData,
  });
}
