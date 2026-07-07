import { useQuery } from "@tanstack/react-query";
import { incompletePunchesApi } from "../services/incomplete-punches.api";
import type { IncompletePunchesFilterRequest } from "../models/api/response/incomplete-punch.model";

const QUERY_KEY = ["incomplete-punches"];

export function useIncompletePunches(filters?: IncompletePunchesFilterRequest) {
  return useQuery({
    queryKey: [...QUERY_KEY, "list", filters],
    queryFn: () => incompletePunchesApi.getAll(filters),
  });
}

export function useIncompletePunch(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "detail", id],
    queryFn: () => incompletePunchesApi.getById(id!),
    enabled: !!id,
  });
}
