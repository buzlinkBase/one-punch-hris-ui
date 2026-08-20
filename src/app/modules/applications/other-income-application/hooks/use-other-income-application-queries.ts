import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { otherIncomeApplicationApi } from "../services/other-income-application.api";
import type { CreateOtherIncomeApplication } from "../models/api/request/create-other-income-application.model";
import type { UpdateOtherIncomeApplication } from "../models/api/request/update-other-income-application.model";

const QUERY_KEY = ["other-income-applications"];

export function useOtherIncomeApplications() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => otherIncomeApplicationApi.getAll(),
  });
}

export function useOtherIncomeApplication(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => otherIncomeApplicationApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateOtherIncomeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOtherIncomeApplication) =>
      otherIncomeApplicationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateOtherIncomeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOtherIncomeApplication) =>
      otherIncomeApplicationApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteOtherIncomeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => otherIncomeApplicationApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
