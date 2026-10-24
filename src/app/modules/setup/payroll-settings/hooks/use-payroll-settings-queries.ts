import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payrollSettingsApi } from "../services/payroll-settings.api";
import type { UpdatePayrollSettings } from "../models/api/request/update-payroll-settings.model";
import { PORTAL_VISIBILITY_QUERY_KEY } from "@/app/modules/portal/shared/hooks/use-my-employee-queries";

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
      queryClient.invalidateQueries({ queryKey: PORTAL_VISIBILITY_QUERY_KEY });
    },
  });
}
