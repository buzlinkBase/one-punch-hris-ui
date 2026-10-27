import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approvalDelegationApi } from "../services/approval-delegation.api";
import type { ApprovalDelegationRequest } from "../models/approval-delegation.model";

const MINE_KEY = ["approval-delegations", "mine"];
const TO_ME_KEY = ["approval-delegations", "to-me"];
const ALL_KEY = ["approval-delegations", "all"];

/** What the caller has delegated away. */
export function useMyDelegations() {
  return useQuery({
    queryKey: MINE_KEY,
    queryFn: () => approvalDelegationApi.getMine(),
  });
}

/** What others have delegated to the caller. */
export function useDelegationsToMe() {
  return useQuery({
    queryKey: TO_ME_KEY,
    queryFn: () => approvalDelegationApi.getToMe(),
  });
}

/** People the caller can pick as a delegate, by name or employee number. */
export function useDelegateCandidates(search: string, enabled: boolean) {
  return useQuery({
    queryKey: ["approval-delegations", "candidates", search],
    queryFn: () => approvalDelegationApi.findCandidates(search),
    enabled,
    staleTime: 30_000,
  });
}

export function useAllDelegations() {
  return useQuery({
    queryKey: ALL_KEY,
    queryFn: () => approvalDelegationApi.getAll(),
  });
}

// Anyone's delegation can change who sees what in My Approvals, so every list is refreshed.
function useInvalidateDelegations() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["approval-delegations"] });
    queryClient.invalidateQueries({ queryKey: ["me", "approvals"] });
  };
}

export function useCreateMyDelegation() {
  const invalidate = useInvalidateDelegations();
  return useMutation({
    mutationFn: (data: ApprovalDelegationRequest) =>
      approvalDelegationApi.createMine(data),
    onSuccess: invalidate,
  });
}

export function useDeactivateMyDelegation() {
  const invalidate = useInvalidateDelegations();
  return useMutation({
    mutationFn: (id: string) => approvalDelegationApi.deactivateMine(id),
    onSuccess: invalidate,
  });
}

export function useCreateDelegation() {
  const invalidate = useInvalidateDelegations();
  return useMutation({
    mutationFn: (data: ApprovalDelegationRequest) =>
      approvalDelegationApi.create(data),
    onSuccess: invalidate,
  });
}

export function useDeactivateDelegation() {
  const invalidate = useInvalidateDelegations();
  return useMutation({
    mutationFn: (id: string) => approvalDelegationApi.deactivate(id),
    onSuccess: invalidate,
  });
}
