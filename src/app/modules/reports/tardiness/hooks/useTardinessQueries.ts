import { useQuery } from "@tanstack/react-query";
import { tardinessApi } from "../services/tardiness.api";
import type { TardinessFilter } from "../models/api/request/tardiness-filter.model";

const QUERY_KEY = ["tardiness"];

export function useTardinessRecords(filter: TardinessFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => tardinessApi.getAll(filter),
  });
}
