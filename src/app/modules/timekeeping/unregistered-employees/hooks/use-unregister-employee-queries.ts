import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unregisterEmployeeApi } from "../services/unregister-employee.api";
import type { UnregisterEmployeeFilter } from "../models/api/request/unregister-employee-filter.model";

export const UNREGISTER_EMPLOYEES_QUERY_KEY = [
  "timekeeping",
  "unregistered-employees",
];
const QUERY_KEY = UNREGISTER_EMPLOYEES_QUERY_KEY;

export function useUnregisterEmployees(filter: UnregisterEmployeeFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => unregisterEmployeeApi.getAll(filter),
    enabled: !!filter.fromDate && !!filter.toDate,
  });
}

export function useTagEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      attId,
    }: {
      employeeId: string;
      attId: string;
    }) => unregisterEmployeeApi.tag(employeeId, attId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
