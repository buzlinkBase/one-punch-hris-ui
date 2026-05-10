import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unregisterEmployeeApi } from "../services/unregister-employee.api";
import type { UnregisterEmployeeFilter } from "../models/api/request/unregister-employee-filter.model";

const QUERY_KEY = ["timekeeping", "unregistered-employees"];

export function useUnregisterEmployees(filter: UnregisterEmployeeFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => unregisterEmployeeApi.getAll(filter),
  });
}

export function useRegisterBiometricEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: string) =>
      unregisterEmployeeApi.registerEmployee(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUnregisterBiometricEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: string) =>
      unregisterEmployeeApi.unregisterEmployee(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
