import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payrollInclusionDefaultsApi } from "../services/payroll-inclusion-defaults.api";
import type { UpdatePayrollInclusionDefaults } from "../models/api/request/update-payroll-inclusion-defaults.model";

const QUERY_KEY = ["setup", "payroll-inclusion-defaults"];

export function usePayrollInclusionDefaults() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => payrollInclusionDefaultsApi.get(),
  });
}

export function useUpdatePayrollInclusionDefaults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePayrollInclusionDefaults) =>
      payrollInclusionDefaultsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
