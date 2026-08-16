import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyPolicyApi } from "../services/company-policy.api";
import type { UpdateCompanyPolicy } from "../models/api/request/update-company-policy.model";

const QUERY_KEY = ["setup", "company-policy"];

export function useCompanyPolicy() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => companyPolicyApi.get(),
  });
}

export function useUpdateCompanyPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCompanyPolicy) => companyPolicyApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
