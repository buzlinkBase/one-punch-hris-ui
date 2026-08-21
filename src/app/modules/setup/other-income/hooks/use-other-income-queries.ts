import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { otherIncomeApi } from "../services/other-income.api";
import type { CreateOtherIncome } from "../models/api/request/create-other-income.model";
import type { UpdateOtherIncome } from "../models/api/request/update-other-income.model";

const QUERY_KEY = ["other-incomes"];

export function useOtherIncomes() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => otherIncomeApi.getAll(),
  });
}

export function useOtherIncome(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => otherIncomeApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateOtherIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOtherIncome) => otherIncomeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateOtherIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOtherIncome) => otherIncomeApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteOtherIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => otherIncomeApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
