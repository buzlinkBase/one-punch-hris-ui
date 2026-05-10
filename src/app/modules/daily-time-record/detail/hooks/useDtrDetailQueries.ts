import { useQuery } from "@tanstack/react-query";
import { dtrDetailApi } from "../services/dtr-detail.api";
import type { DtrDetailFilter } from "../models/api/request/dtr-detail-filter.model";

const QUERY_KEY = ["daily-time-record", "detail"];

export function useDtrDetailRecords(filter: DtrDetailFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => dtrDetailApi.getAll(filter),
  });
}
