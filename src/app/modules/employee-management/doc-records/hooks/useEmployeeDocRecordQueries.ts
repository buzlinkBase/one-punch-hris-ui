import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeDocRecordApi } from "../services/employee-doc-record.api";
import type { CreateEmployeeDocRecord } from "../models/api/request/create-employee-doc-record.model";
import type { UpdateEmployeeDocRecord } from "../models/api/request/update-employee-doc-record.model";

const QUERY_KEY = ["employee-doc-records"];

export function useEmployeeDocRecords() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => employeeDocRecordApi.getAll(),
  });
}

export function useEmployeeDocRecord(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => employeeDocRecordApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateEmployeeDocRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeDocRecord) => employeeDocRecordApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateEmployeeDocRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmployeeDocRecord) => employeeDocRecordApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteEmployeeDocRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeDocRecordApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
