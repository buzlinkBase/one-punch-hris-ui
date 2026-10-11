import { useMemo } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { userApi } from "../services/user.api";
import { userLinkApi } from "../services/user-link.api";
import { batchInvitationApi } from "../services/batch-invitation.api";
import { classifyUsers, hasAccount } from "../utils/classify-users";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import type { SendInvitationRequest } from "../models/api/request/send-invitation-request.model";
import type {
  BatchInvitationRequest,
  InviteEntityType,
} from "../models/api/request/batch-invitation-request.model";

const QUERY_KEY = ["users"];

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => userApi.getAll(),
  });
}

/**
 * The members, each tagged as an employee user, client user or other. Accounts are linked by user
 * id; invites not yet accepted by email. Until the links load (or if they fail) everyone shows,
 * just untagged.
 */
export function useUserRows() {
  const users = useUsers();
  const members = useMemo(() => users.data ?? [], [users.data]);

  const request = useMemo(
    () => ({
      userIds: members
        .filter(hasAccount)
        .map((m) => m.userId)
        .sort(),
      emails: members
        .filter((m) => !hasAccount(m))
        .map((m) => (m.email ?? "").trim().toLowerCase())
        .filter(Boolean)
        .sort(),
    }),
    [members],
  );

  const links = useQuery({
    queryKey: [...QUERY_KEY, "links", request],
    queryFn: () => userLinkApi.getLinks(request),
    enabled: members.length > 0,
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(
    () => classifyUsers(members, links.data ?? []),
    [members, links.data],
  );

  return {
    rows,
    isLoading: users.isLoading,
    isFetching: users.isFetching || links.isFetching,
    refetch: users.refetch,
  };
}

export interface BulkResult {
  succeeded: number;
  failed: number;
}

async function settle(tasks: Promise<unknown>[]): Promise<BulkResult> {
  const results = await Promise.allSettled(tasks);
  const failed = results.filter((r) => r.status === "rejected").length;
  return { succeeded: results.length - failed, failed };
}

/** Sets one status on many members; each is applied on its own so one failure doesn't stop the rest. */
export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipIds,
      status,
    }: {
      membershipIds: string[];
      status: string;
    }) => settle(membershipIds.map((id) => userApi.updateStatus(id, status))),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useBulkRemoveMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ membershipIds }: { membershipIds: string[] }) =>
      settle(membershipIds.map((id) => userApi.removeMembership(id))),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
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

/**
 * The batch invite modal's live lookup: for each (syntactically valid) email, AuthApi's
 * member / pending-invite check and hrms-api's employee or client match, fetched together.
 */
export function useBatchInviteLookup(
  emails: string[],
  entityType: InviteEntityType,
  clientId: string | undefined,
) {
  const sorted = [...emails].sort();
  return useQuery({
    queryKey: ["batch-invite-lookup", entityType, clientId, sorted],
    queryFn: async () => {
      const [checks, matches] = await Promise.all([
        batchInvitationApi.check(sorted),
        entityType === "Client"
          ? batchInvitationApi.matchClientLogins(clientId!, sorted)
          : batchInvitationApi.matchEmployees(sorted),
      ]);
      return { checks, matches };
    },
    enabled:
      sorted.length > 0 && (entityType === "Employee" || Boolean(clientId)),
    placeholderData: keepPreviousData,
  });
}

export function useSendBatchInvitations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: BatchInvitationRequest;
      idempotencyKey: string;
    }) => batchInvitationApi.send(payload, idempotencyKey),
    onSuccess: () => {
      // Invited people appear on the Users page as "Invited" members.
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["batch-invite-lookup"] });
    },
  });
}
