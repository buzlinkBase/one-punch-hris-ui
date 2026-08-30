import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyInfoApi } from "../services/company-info.api";
import type { UpdateCompanyInfo } from "../models/api/request/update-company-info.model";

const QUERY_KEY = ["setup", "company-info"];

export function useCompanyInfo() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => companyInfoApi.get(),
  });
}

export function useUpdateCompanyInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCompanyInfo) => companyInfoApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
