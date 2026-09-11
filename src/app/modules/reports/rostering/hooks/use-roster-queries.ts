import { useQuery } from "@tanstack/react-query";
import { rosterApi } from "../services/roster.api";
import type { RosterFilter } from "../models/api/request/roster-filter.model";

const QUERY_KEY = ["roster"];

// searchNonce is bumped by the caller on every explicit Search/Clear click so the query key is
// always new -- otherwise clicking Search again with unchanged filter values (or a combo already
// cached within staleTime) would just serve cached data instead of hitting the API.
export function useRosterRecords(filter: RosterFilter = {}, searchNonce = 0) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter, searchNonce],
    queryFn: () => rosterApi.getAll(filter),
    enabled: !!(filter.fromDate && filter.toDate),
  });
}
