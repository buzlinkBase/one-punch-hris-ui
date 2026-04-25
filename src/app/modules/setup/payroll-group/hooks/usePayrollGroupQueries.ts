import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payrollGroupApi } from "../services/payroll-group.api";
import type { CreatePayrollGroup } from "../models/api/request/create-payroll-group.model";
import type { UpdatePayrollGroup } from "../models/api/request/update-payroll-group.model";

const QUERY_KEY = ["payroll-groups"];

export function usePayrollGroups() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => payrollGroupApi.getAll(),
  });
}

export function usePayrollGroup(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => payrollGroupApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePayrollGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePayrollGroup) => payrollGroupApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdatePayrollGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePayrollGroup) => payrollGroupApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeletePayrollGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollGroupApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
