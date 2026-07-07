import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentApi } from "../services/department.api";
import type { CreateDepartment } from "../models/api/request/create-department.model";
import type { UpdateDepartment } from "../models/api/request/update-department.model";

const QUERY_KEY = ["departments"];

export function useDepartments() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => departmentApi.getAll(),
  });
}

export function useDepartment(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => departmentApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartment) => departmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDepartment) => departmentApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
