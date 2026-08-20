import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "../services/employee.api";
import type { CreateEmployee } from "../models/api/request/create-employee.model";
import type { UpdateEmployee } from "../models/api/request/update-employee.model";

const QUERY_KEY = ["employees"];

export function useEmployees() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => employeeApi.getAll(),
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => employeeApi.getById(id!),
    enabled: !!id,
  });
}

export function useEmployeeFull(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, "full"],
    queryFn: () => employeeApi.getFullById(id!),
    enabled: !!id,
    staleTime: 0,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployee) => employeeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmployee) => employeeApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDownloadEmployeeTemplate() {
  return useMutation({
    mutationFn: () => employeeApi.downloadTemplate(),
  });
}

export function useUploadEmployees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => employeeApi.uploadEmployees(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
