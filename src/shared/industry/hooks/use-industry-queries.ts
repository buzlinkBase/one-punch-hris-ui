import { useQuery } from "@tanstack/react-query";
import { industryApi } from "../services/industry.api";

const QUERY_KEY = ["shared", "industries"];

// The lookup changes rarely (platform operators edit it), so keep it for the session.
const ONE_HOUR_MS = 60 * 60 * 1000;

export function useIndustries() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => industryApi.getAll(),
    staleTime: ONE_HOUR_MS,
  });
}
