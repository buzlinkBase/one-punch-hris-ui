import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { minimumWageRateApi } from "../services/minimum-wage-rate.api";
import type { CreateMinimumWageRate } from "../models/api/request/create-minimum-wage-rate.model";
import type { UpdateMinimumWageRate } from "../models/api/request/update-minimum-wage-rate.model";

const QUERY_KEY = ["minimum-wage-rates"];

export function useMinimumWageRates() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => minimumWageRateApi.getAll(),
  });
}

export function useMinimumWageRate(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => minimumWageRateApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateMinimumWageRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMinimumWageRate) =>
      minimumWageRateApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateMinimumWageRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMinimumWageRate) =>
      minimumWageRateApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteMinimumWageRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => minimumWageRateApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
