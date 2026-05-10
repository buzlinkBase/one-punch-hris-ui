import { useQuery } from "@tanstack/react-query";
import { dtrSummaryApi } from "../services/dtr-summary.api";
import type { DtrSummaryFilter } from "../models/api/request/dtr-summary-filter.model";

const QUERY_KEY = ["daily-time-record", "summary"];

export function useDtrSummaryRecords(filter: DtrSummaryFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => dtrSummaryApi.getAll(filter),
  });
}
