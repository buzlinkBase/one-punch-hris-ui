import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { complianceAcknowledgmentApi } from "../services/compliance-acknowledgment.api";

const QUERY_KEY = ["setup", "compliance-acknowledgments"];

// Saves on the other settings tabs record (or bring in) deviations, so read fresh each time the
// tab opens rather than the 5-minute default.
const ALWAYS_FRESH = 0;

export function useComplianceAcknowledgments(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, pageSize],
    queryFn: () => complianceAcknowledgmentApi.list(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: ALWAYS_FRESH,
  });
}

export function useOutstandingDeviations() {
  return useQuery({
    queryKey: [...QUERY_KEY, "outstanding"],
    queryFn: () => complianceAcknowledgmentApi.outstanding(),
    staleTime: ALWAYS_FRESH,
  });
}

export function useConfirmOutstandingDeviations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => complianceAcknowledgmentApi.confirmOutstanding(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
