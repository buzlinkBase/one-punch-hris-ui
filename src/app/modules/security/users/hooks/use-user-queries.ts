import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../services/user.api";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import type { SendInvitationRequest } from "../models/api/request/send-invitation-request.model";

const QUERY_KEY = ["users"];

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => userApi.getAll(),
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => userApi.getById(id!),
    enabled: !!id,
  });
}

export function useReplaceRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipId,
      roles,
    }: {
      membershipId: string;
      roles: string[];
    }) => userApi.replaceRoles(membershipId, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipId,
      status,
    }: {
      membershipId: string;
      status: string;
    }) => userApi.updateStatus(membershipId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useRemoveMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ membershipId }: { membershipId: string }) =>
      userApi.removeMembership(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useSendInvitation() {
  return useMutation({
    mutationFn: (data: SendInvitationRequest) => authApi.sendInvitation(data),
  });
}
