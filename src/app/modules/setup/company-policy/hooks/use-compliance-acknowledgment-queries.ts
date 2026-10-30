import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { complianceAcknowledgmentApi } from "../services/compliance-acknowledgment.api";

export function useComplianceAcknowledgments(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["setup", "compliance-acknowledgments", page, pageSize],
    queryFn: () => complianceAcknowledgmentApi.list(page, pageSize),
    placeholderData: keepPreviousData,
  });
}
