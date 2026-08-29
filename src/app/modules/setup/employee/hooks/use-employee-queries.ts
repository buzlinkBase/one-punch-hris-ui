import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "../services/employee.api";
import type { CreateEmployee } from "../models/api/request/create-employee.model";
import type { UpdateEmployee } from "../models/api/request/update-employee.model";
import { QUERY_KEY as ATTENDANCE_ENTRY_QUERY_KEY } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";

const QUERY_KEY = ["employees"];

// attendance-entry's useEmployeeFilter() is the employee dropdown source for 20+
// other modules (DTR, applications, change-schedule, biometric) — it's backed by a
// separate endpoint/query key, so employee create/update/delete/upload must also
// invalidate it or those dropdowns keep showing pre-edit data until staleTime lapses.
function invalidateEmployeeFilter(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: ATTENDANCE_ENTRY_QUERY_KEY });
}

export function useEmployees(keyword?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, { keyword: keyword ?? "" }],
    queryFn: () => employeeApi.getAll(keyword),
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
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["employee-fixed-schedule", created.id],
      });
      invalidateEmployeeFilter(queryClient);
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
      queryClient.invalidateQueries({
        queryKey: ["employee-fixed-schedule", updated.id],
      });
      invalidateEmployeeFilter(queryClient);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      invalidateEmployeeFilter(queryClient);
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
      invalidateEmployeeFilter(queryClient);
    },
  });
}
