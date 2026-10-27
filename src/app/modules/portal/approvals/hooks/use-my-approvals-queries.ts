import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { myApprovalsApi } from "../services/my-approvals.api";
import { APPROVAL_LIST_QUERY_KEYS } from "@/core/signalr/approval-query-keys";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";

export const MY_APPROVALS_QUERY_KEY = ["me", "approvals"];

/** Requests waiting on the signed-in person -- directly or through a delegation. */
export function usePendingApprovals() {
  return useQuery({
    queryKey: [...MY_APPROVALS_QUERY_KEY, "pending"],
    queryFn: () => myApprovalsApi.getPending(),
  });
}

/** Requests still being approved that the signed-in person follows but that aren't their turn. */
export function useInProgressApprovals() {
  return useQuery({
    queryKey: [...MY_APPROVALS_QUERY_KEY, "in-progress"],
    queryFn: () => myApprovalsApi.getInProgress(),
  });
}

export function useActOnApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      applicationType: ApprovalApplicationType;
      applicationId: string;
      action: "approve" | "decline";
      note?: string;
    }) =>
      myApprovalsApi.act(
        vars.applicationType,
        vars.applicationId,
        vars.action,
        vars.note,
      ),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: MY_APPROVALS_QUERY_KEY });
      // The request's own screens show its new status too.
      queryClient.invalidateQueries({
        queryKey: [
          "approval-instance",
          vars.applicationType,
          vars.applicationId,
        ],
      });
      APPROVAL_LIST_QUERY_KEYS[vars.applicationType].forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      );
    },
  });
}
