import { useQuery } from "@tanstack/react-query";
import { rosterApi } from "../services/roster.api";
import type { RosterFilter } from "../models/api/request/roster-filter.model";

const QUERY_KEY = ["roster"];

export function useRosterRecords(filter: RosterFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => rosterApi.getAll(filter),
    enabled: !!(filter.fromDate && filter.toDate),
  });
}
