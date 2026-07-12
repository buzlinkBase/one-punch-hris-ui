import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../services/dashboard.api";

const QUERY_KEY = ["dashboard", "overview"];

export function useDashboardOverview() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => dashboardApi.getOverview(),
  });
}
