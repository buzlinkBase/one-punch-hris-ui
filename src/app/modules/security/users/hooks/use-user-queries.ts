import { useMemo } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { userApi } from "../services/user.api";
import { userLinkApi } from "../services/user-link.api";
import { clientUserApi } from "../services/client-user.api";
import { batchInvitationApi } from "../services/batch-invitation.api";
import {
  classifyUsers,
  hasAccount,
  mergeClientUsers,
} from "../utils/classify-users";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import type { UserRow } from "../models/api/response/user-response.model";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import type { SendInvitationRequest } from "../models/api/request/send-invitation-request.model";
import type {
  BatchInvitationRequest,
  InviteEntityType,
} from "../models/api/request/batch-invitation-request.model";

const QUERY_KEY = ["users"];

/** Who may see and manage the client-portal users of the company. */
const CLIENT_USERS_PERMISSION = "clientportal:Client:Manage";

/** The part of a row that says how to change it: company members by id, client-portal users through their client. */
type MemberRef = Pick<UserRow, "id" | "portal">;

/** Company members change through the company; client-portal users through their client. */
const setRowStatus = (row: MemberRef, status: string) =>
  row.portal
    ? clientUserApi.updateStatus(
        row.portal.clientEntityId,
        row.portal.membershipId,
        status === "Active",
      )
    : userApi.updateStatus(row.id, status);

const removeRow = (row: MemberRef) =>
  row.portal
    ? clientUserApi.remove(row.portal.clientEntityId, row.portal.membershipId)
    : userApi.removeMembership(row.id);

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

  // Client-portal users are not company members, so they come from their own list.
  const canSeeClientUsers = useHasPermission(CLIENT_USERS_PERMISSION);
  const clientUsers = useQuery({
    queryKey: [...QUERY_KEY, "client-users"],
    queryFn: () => clientUserApi.getAll(),
    enabled: canSeeClientUsers,
  });

  const rows = useMemo(
    () =>
      mergeClientUsers(
        classifyUsers(members, links.data ?? []),
        clientUsers.data ?? [],
      ),
    [members, links.data, clientUsers.data],
  );

  return {
    rows,
    isLoading: users.isLoading,
    isFetching: users.isFetching || links.isFetching || clientUsers.isFetching,
    refetch: () => {
      void clientUsers.refetch();
      return users.refetch();
    },
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
    mutationFn: ({ rows, status }: { rows: UserRow[]; status: string }) =>
      settle(rows.map((row) => setRowStatus(row, status))),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useBulkRemoveMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rows }: { rows: UserRow[] }) => settle(rows.map(removeRow)),
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
    mutationFn: ({ row, status }: { row: MemberRef; status: string }) =>
      setRowStatus(row, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useRemoveMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ row }: { row: MemberRef }) => removeRow(row),
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
 * The batch invite modal's live lookup for employee invites: for each (syntactically valid) email,
 * AuthApi's member / pending-invite check and hrms-api's employee match, fetched together.
 * Client logins go through the client portal instead and aren't looked up.
 */
export function useBatchInviteLookup(
  emails: string[],
  entityType: InviteEntityType,
) {
  const sorted = [...emails].sort();
  return useQuery({
    queryKey: ["batch-invite-lookup", entityType, sorted],
    queryFn: async () => {
      const [checks, matches] = await Promise.all([
        batchInvitationApi.check(sorted),
        batchInvitationApi.matchEmployees(sorted),
      ]);
      return { checks, matches };
    },
    enabled: sorted.length > 0 && entityType === "Employee",
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
