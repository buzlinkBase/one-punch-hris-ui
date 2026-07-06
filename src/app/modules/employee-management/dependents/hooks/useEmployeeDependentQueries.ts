import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeDependentApi } from "../services/employee-dependent.api";
import type { CreateEmployeeDependent } from "../models/api/request/create-employee-dependent.model";
import type { UpdateEmployeeDependent } from "../models/api/request/update-employee-dependent.model";

const QUERY_KEY = ["employee-dependents"];

export function useEmployeeDependents() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => employeeDependentApi.getAll(),
  });
}

export function useEmployeeDependent(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => employeeDependentApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateEmployeeDependent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeDependent) =>
      employeeDependentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateEmployeeDependent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmployeeDependent) =>
      employeeDependentApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteEmployeeDependent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeDependentApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
