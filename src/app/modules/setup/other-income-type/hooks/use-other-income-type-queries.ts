import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { otherIncomeTypeApi } from "../services/other-income-type.api";
import type { CreateOtherIncomeType } from "../models/api/request/create-other-income-type.model";
import type { UpdateOtherIncomeType } from "../models/api/request/update-other-income-type.model";

const QUERY_KEY = ["other-income-types"];

export function useOtherIncomeTypes() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => otherIncomeTypeApi.getAll(),
  });
}

export function useOtherIncomeType(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => otherIncomeTypeApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateOtherIncomeType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOtherIncomeType) =>
      otherIncomeTypeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateOtherIncomeType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOtherIncomeType) =>
      otherIncomeTypeApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteOtherIncomeType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => otherIncomeTypeApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
