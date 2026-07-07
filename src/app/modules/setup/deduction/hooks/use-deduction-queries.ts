import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deductionApi } from "../services/deduction.api";
import type { CreateDeduction } from "../models/api/request/create-deduction.model";
import type { UpdateDeduction } from "../models/api/request/update-deduction.model";

const QUERY_KEY = ["deductions"];

export function useDeductions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => deductionApi.getAll(),
  });
}

export function useDeduction(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => deductionApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateDeduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeduction) => deductionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateDeduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDeduction) => deductionApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteDeduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deductionApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
