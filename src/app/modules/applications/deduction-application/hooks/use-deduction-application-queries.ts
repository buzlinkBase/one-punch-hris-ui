import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deductionApplicationApi } from "../services/deduction-application.api";
import type { CreateDeductionApplication } from "../models/api/request/create-deduction-application.model";
import type { UpdateDeductionApplication } from "../models/api/request/update-deduction-application.model";

const QUERY_KEY = ["deduction-applications"];

export function useDeductionApplications() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => deductionApplicationApi.getAll(),
  });
}

export function useDeductionApplication(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => deductionApplicationApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateDeductionApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeductionApplication) =>
      deductionApplicationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateDeductionApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDeductionApplication) =>
      deductionApplicationApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteDeductionApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deductionApplicationApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useApproveDeductionApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      deductionApplicationApi.approve(id, note),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "Loan", id],
      });
    },
  });
}

export function useDeclineDeductionApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      deductionApplicationApi.decline(id, note),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "Loan", id],
      });
    },
  });
}
