import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deductionTypeApi } from "../services/deduction-type.api";
import type { CreateDeductionType } from "../models/api/request/create-deduction-type.model";
import type { UpdateDeductionType } from "../models/api/request/update-deduction-type.model";

const QUERY_KEY = ["deduction-types"];

export function useDeductionTypes() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => deductionTypeApi.getAll(),
  });
}

export function useDeductionType(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => deductionTypeApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateDeductionType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeductionType) => deductionTypeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateDeductionType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDeductionType) => deductionTypeApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteDeductionType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deductionTypeApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
