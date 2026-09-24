import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approvalApi } from "../services/approval.api";
import type { ApprovalApplicationType } from "../types/approval.model";

// A record filed before this engine shipped (or never yet acted on) may 404 -- that's a valid
// "no instance yet" state, not a transient error, so this never retries and callers should treat
// isError as "fall back to today's plain single-step behavior", not as a failure to surface.
export function useApprovalInstance(
  applicationType: ApprovalApplicationType,
  applicationId: string | undefined,
) {
  return useQuery({
    queryKey: ["approval-instance", applicationType, applicationId],
    queryFn: () => approvalApi.getInstance(applicationType, applicationId!),
    enabled: !!applicationId,
    retry: false,
  });
}

export function useApprovalEligibility(
  applicationType: ApprovalApplicationType,
  applicationId: string | undefined,
) {
  return useQuery({
    queryKey: ["approval-eligibility", applicationType, applicationId],
    queryFn: () => approvalApi.getEligibility(applicationType, applicationId!),
    enabled: !!applicationId,
    retry: false,
  });
}

export function useReassignApprover(
  applicationType: ApprovalApplicationType,
  applicationId: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { newApproverEmployeeId: string; note?: string }) =>
      approvalApi.reassignApprover(applicationType, applicationId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", applicationType, applicationId],
      });
    },
  });
}
