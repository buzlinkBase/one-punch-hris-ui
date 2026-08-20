import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payrollSettingsApi } from "../services/payroll-settings.api";
import type { UpdatePayrollSettings } from "../models/api/request/update-payroll-settings.model";

const QUERY_KEY = ["payroll-settings"];

export function usePayrollSettings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => payrollSettingsApi.get(),
  });
}

export function useUpdatePayrollSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePayrollSettings) =>
      payrollSettingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
