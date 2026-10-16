import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { problemDetail } from "@/core/auth/guard-error";
import type { BatchInvitationResult } from "@/app/modules/security/users/models/api/response/batch-invitation-response.model";
import { clientPortalApi } from "../services/client-portal.api";
import type {
  AllocationRequest,
  GenerateInvoiceRequest,
  HrisClientRef,
  InviteClientAdminRequest,
  PortalConnectionRequest,
  RateRequest,
  RecordPaymentRequest,
  VerifyPeriodRequest,
} from "../models/api/request/client-portal-request.model";
import type {
  BillingProfile,
  CheckStatus,
  DeliveryMode,
  PortalModuleSwitches,
} from "../models/api/response/client-portal-response.model";

const KEY = ["client-portal"] as const;

// ---- billing ----

export function useBillingProfile(clientId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "billing-profile", clientId],
    queryFn: () => clientPortalApi.getProfile(clientId!),
    enabled: !!clientId,
  });
}

export function useSaveBillingProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { clientId: string; profile: BillingProfile }) =>
      clientPortalApi.saveProfile(v.clientId, v.profile),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "billing-profile"] }),
  });
}

export function useContractRates(clientId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "rates", clientId],
    queryFn: () => clientPortalApi.listRates(clientId!),
    enabled: !!clientId,
  });
}

export function useAddContractRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { clientId: string; request: RateRequest }) =>
      clientPortalApi.addRate(v.clientId, v.request),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "rates"] }),
  });
}

export interface InvoiceListQuery {
  clientId?: string;
  status?: string;
  search?: string;
  page: number;
  pageSize: number;
}

export function useInvoices(query: InvoiceListQuery) {
  return useQuery({
    queryKey: [...KEY, "invoices", query],
    queryFn: () => clientPortalApi.listInvoices(query),
    placeholderData: keepPreviousData,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "invoice", id],
    queryFn: () => clientPortalApi.getInvoice(id!),
    enabled: !!id,
  });
}

/** One mutation shape for every invoice action: run it, then refresh the lists, the open invoice and the payments. */
function useInvoiceAction<TArgs, TResult>(
  run: (args: TArgs) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...KEY, "invoices"] });
      await queryClient.invalidateQueries({ queryKey: [...KEY, "invoice"] });
      await queryClient.invalidateQueries({ queryKey: [...KEY, "payments"] });
    },
  });
}

export const useGenerateInvoice = () =>
  useInvoiceAction((request: GenerateInvoiceRequest) =>
    clientPortalApi.generateInvoice(request),
  );

export const useUploadInvoice = () =>
  useInvoiceAction((form: FormData) => clientPortalApi.uploadInvoice(form));

export const useReplaceInvoiceFile = () =>
  useInvoiceAction((v: { id: string; form: FormData }) =>
    clientPortalApi.replaceInvoiceFile(v.id, v.form),
  );

export const useAddAdjustment = () =>
  useInvoiceAction(
    (v: {
      id: string;
      body: { description: string; amount: number; reason: string };
    }) => clientPortalApi.addAdjustment(v.id, v.body),
  );

export const useRemoveAdjustment = () =>
  useInvoiceAction((v: { id: string; lineId: string }) =>
    clientPortalApi.removeAdjustment(v.id, v.lineId),
  );

export const useSetInvoiceDelivery = () =>
  useInvoiceAction(
    (v: { id: string; mode: DeliveryMode; showInPortal: boolean }) =>
      clientPortalApi.setDelivery(v.id, {
        mode: v.mode,
        showInPortal: v.showInPortal,
      }),
  );

export const useInvoiceStep = () =>
  useInvoiceAction((v: { id: string; step: "submit" | "approve" | "issue" }) =>
    clientPortalApi.invoiceStep(v.id, v.step),
  );

export const useResendInvoice = () =>
  useInvoiceAction((v: { id: string; extraEmails: string[] }) =>
    clientPortalApi.resendInvoice(v.id, v.extraEmails),
  );

export const useVoidInvoice = () =>
  useInvoiceAction((v: { id: string; reason: string }) =>
    clientPortalApi.voidInvoice(v.id, v.reason),
  );

export function usePortalPayments(
  clientId: string | undefined,
  status: string | undefined,
) {
  return useQuery({
    queryKey: [...KEY, "payments", clientId, status],
    queryFn: () => clientPortalApi.listPayments(clientId, status),
  });
}

export const useRecordPayment = () =>
  useInvoiceAction((request: RecordPaymentRequest) =>
    clientPortalApi.recordPayment(request),
  );

export const useConfirmPayment = () =>
  useInvoiceAction(
    (v: {
      id: string;
      receiptNumber: string | null;
      allocations: AllocationRequest[] | null;
    }) =>
      clientPortalApi.confirmPayment(v.id, {
        receiptNumber: v.receiptNumber,
        allocations: v.allocations,
      }),
  );

export const useRejectPayment = () =>
  useInvoiceAction((v: { id: string; reason: string }) =>
    clientPortalApi.rejectPayment(v.id, v.reason),
  );

export const useSetCheckStatus = () =>
  useInvoiceAction((v: { id: string; status: CheckStatus }) =>
    clientPortalApi.setCheckStatus(v.id, v.status),
  );

// ---- operations: vault, notices, scorecard, manpower ----

export const useVaultGuards = (clientId?: string) =>
  useQuery({
    queryKey: [...KEY, "vault-guards", clientId],
    queryFn: () => clientPortalApi.vaultGuards(clientId),
  });

export const useVaultDocuments = (clientId?: string, guardId?: string) =>
  useQuery({
    queryKey: [...KEY, "vault-documents", clientId, guardId],
    queryFn: () => clientPortalApi.vaultDocuments(clientId, guardId),
  });

export const useVaultExpiring = (withinDays: number, clientId?: string) =>
  useQuery({
    queryKey: [...KEY, "vault-expiring", withinDays, clientId],
    queryFn: () => clientPortalApi.vaultExpiring(withinDays, clientId),
  });

function useVaultAction<TArgs>(run: (args: TArgs) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: async () => {
      for (const part of ["vault-guards", "vault-documents", "vault-expiring"])
        await queryClient.invalidateQueries({ queryKey: [...KEY, part] });
    },
  });
}

export const useUploadVaultDocument = () =>
  useVaultAction((form: FormData) => clientPortalApi.uploadVaultDocument(form));

export const useDeleteVaultDocument = () =>
  useVaultAction((id: string) => clientPortalApi.deleteVaultDocument(id));

export const usePortalNotices = () =>
  useQuery({
    queryKey: [...KEY, "notices"],
    queryFn: () => clientPortalApi.listNotices(),
  });

export const useSaveNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      id: string | null;
      body: {
        clientId: string | null;
        title: string;
        body: string;
        pinned: boolean;
        publishAt: string | null;
        expiresAt: string | null;
      };
    }) => clientPortalApi.saveNotice(v.id, v.body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "notices"] }),
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientPortalApi.deleteNotice(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "notices"] }),
  });
};

export const useScorecard = (clientId?: string, from?: string, to?: string) =>
  useQuery({
    queryKey: [...KEY, "scorecard", clientId, from, to],
    queryFn: () => clientPortalApi.scorecard(clientId, from, to),
  });

export const useManpowerRequests = (clientId?: string, status?: string) =>
  useQuery({
    queryKey: [...KEY, "manpower", clientId, status],
    queryFn: () => clientPortalApi.listManpower(clientId, status),
  });

export const useDispatchManpower = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientPortalApi.dispatchManpower(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "manpower"] }),
  });
};

export const useVaultAlertSettings = () =>
  useQuery({
    queryKey: [...KEY, "vault-alerts"],
    queryFn: () => clientPortalApi.vaultAlertSettings(),
  });

export const useSaveVaultAlertSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emails: string) =>
      clientPortalApi.saveVaultAlertSettings(emails),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "vault-alerts"] }),
  });
};

export const useDecideManpower = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; approve: boolean; note: string | null }) =>
      clientPortalApi.decideManpower(v.id, {
        approve: v.approve,
        note: v.note,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "manpower"] }),
  });
};

// ---- collections, reports, disputes, memos, 2307, statements ----

export const useOverdue = (clientId?: string) =>
  useQuery({
    queryKey: [...KEY, "overdue", clientId],
    queryFn: () => clientPortalApi.listOverdue(clientId),
  });

export const useCollectionNotes = (invoiceId: string | undefined) =>
  useQuery({
    queryKey: [...KEY, "notes", invoiceId],
    queryFn: () => clientPortalApi.listNotes(invoiceId!),
    enabled: !!invoiceId,
  });

export const useInvoiceHistory = (invoiceId: string | undefined) =>
  useQuery({
    queryKey: [...KEY, "history", invoiceId],
    queryFn: () => clientPortalApi.invoiceHistory(invoiceId!),
    enabled: !!invoiceId,
  });

export const useBillingDashboard = (clientId?: string) =>
  useQuery({
    queryKey: [...KEY, "dashboard", clientId],
    queryFn: () => clientPortalApi.dashboard(clientId),
  });

export const useAgingReport = (clientId?: string) =>
  useQuery({
    queryKey: [...KEY, "aging", clientId],
    queryFn: () => clientPortalApi.aging(clientId),
  });

export const useCollectionsReport = (
  from: string,
  to: string,
  clientId?: string,
) =>
  useQuery({
    queryKey: [...KEY, "collections-report", from, to, clientId],
    queryFn: () => clientPortalApi.collectionsReport(from, to, clientId),
  });

export const useBillingSummary = (from: string, to: string) =>
  useQuery({
    queryKey: [...KEY, "billing-summary", from, to],
    queryFn: () => clientPortalApi.billingSummary(from, to),
  });

export const useMissing2307 = (clientId?: string) =>
  useQuery({
    queryKey: [...KEY, "missing-2307", clientId],
    queryFn: () => clientPortalApi.missing2307(clientId),
  });

export const useAddCollectionNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      invoiceId: string;
      body: {
        kind: string;
        contact: string;
        note: string;
        promisedDate: string | null;
      };
    }) => clientPortalApi.addNote(v.invoiceId, v.body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...KEY, "notes"] });
      await queryClient.invalidateQueries({ queryKey: [...KEY, "overdue"] });
      await queryClient.invalidateQueries({ queryKey: [...KEY, "history"] });
    },
  });
};

export const usePortalDisputes = (clientId?: string, status?: string) =>
  useQuery({
    queryKey: [...KEY, "disputes", clientId, status],
    queryFn: () => clientPortalApi.listDisputes(clientId, status),
  });

export const usePortalDispute = (id: string | undefined) =>
  useQuery({
    queryKey: [...KEY, "dispute", id],
    queryFn: () => clientPortalApi.getDispute(id!),
    enabled: !!id,
  });

/** Dispute actions change the dispute, and a credit changes the invoice, so refresh both. */
function useDisputeAction<TArgs>(run: (args: TArgs) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...KEY, "disputes"] });
      await queryClient.invalidateQueries({ queryKey: [...KEY, "dispute"] });
      await queryClient.invalidateQueries({ queryKey: [...KEY, "invoice"] });
      await queryClient.invalidateQueries({ queryKey: [...KEY, "invoices"] });
    },
  });
}

export const useCommentDispute = () =>
  useDisputeAction((v: { id: string; body: string }) =>
    clientPortalApi.commentDispute(v.id, v.body),
  );

export const useReviewDispute = () =>
  useDisputeAction((id: string) => clientPortalApi.reviewDispute(id));

export const useResolveDispute = () =>
  useDisputeAction(
    (v: {
      id: string;
      accept: boolean;
      outcome: string;
      creditSubtotal: number | null;
    }) =>
      clientPortalApi.resolveDispute(v.id, {
        accept: v.accept,
        outcome: v.outcome,
        creditSubtotal: v.creditSubtotal,
      }),
  );

export const useCreateMemo = () =>
  useInvoiceAction(
    (v: {
      invoiceId: string;
      kind: "Credit" | "Debit";
      subtotal: number;
      reason: string;
    }) => clientPortalApi.createMemo(v),
  );

export const useCerts2307 = (invoiceId: string | undefined) =>
  useQuery({
    queryKey: [...KEY, "certs-2307", invoiceId],
    queryFn: () => clientPortalApi.list2307(invoiceId!),
    enabled: !!invoiceId,
  });

export const useUpload2307 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => clientPortalApi.upload2307(form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [...KEY, "certs-2307"] });
      await queryClient.invalidateQueries({
        queryKey: [...KEY, "missing-2307"],
      });
      await queryClient.invalidateQueries({ queryKey: [...KEY, "history"] });
    },
  });
};

export const useStatement = (
  clientId: string | undefined,
  from: string,
  to: string,
) =>
  useQuery({
    queryKey: [...KEY, "statement", clientId, from, to],
    queryFn: () => clientPortalApi.statement(clientId!, from, to),
    enabled: !!clientId,
  });

export const useEmailStatement = () =>
  useMutation({
    mutationFn: (v: { clientId: string; from: string; to: string }) =>
      clientPortalApi.emailStatement(v.clientId, v.from, v.to),
  });

export function usePortalConnection() {
  return useQuery({
    queryKey: [...KEY, "connection"],
    queryFn: () => clientPortalApi.getConnection(),
  });
}

export function useSavePortalConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PortalConnectionRequest) =>
      clientPortalApi.saveConnection(request),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "connection"] }),
  });
}

/** Sends every HRIS client to the portal (the portal makes or updates its copy of each by id). */
export function useSendAllPortalClients() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clientPortalApi.sendAllClients(),
    // The portal creates its copies a moment later, so the list is stale either way.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "clients"] }),
  });
}

export function usePortalClients() {
  return useQuery({
    queryKey: [...KEY, "clients"],
    queryFn: () => clientPortalApi.listClients(),
  });
}

export function usePortalModules(clientId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "modules", clientId],
    queryFn: () => clientPortalApi.getModules(clientId!),
    enabled: !!clientId,
  });
}

export function usePortalUsers(clientId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "users", clientId],
    queryFn: () => clientPortalApi.listUsers(clientId!),
    enabled: !!clientId,
  });
}

export function usePortalSources() {
  return useQuery({
    queryKey: [...KEY, "sources"],
    queryFn: () => clientPortalApi.listSources(),
  });
}

export function usePortalPeriods(clientId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "periods", clientId],
    queryFn: () => clientPortalApi.listPeriods(clientId!),
    enabled: !!clientId,
  });
}

export function usePortalFlags(
  clientId: string | undefined,
  includeResolved: boolean,
) {
  return useQuery({
    queryKey: [...KEY, "flags", clientId, includeResolved],
    queryFn: () => clientPortalApi.listFlags(clientId!, includeResolved),
    enabled: !!clientId,
  });
}

export function useSetPortalClientActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; active: boolean }) =>
      clientPortalApi.setClientActive(v.id, v.active),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "clients"] }),
  });
}

export function useSetPortalModules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; modules: PortalModuleSwitches }) =>
      clientPortalApi.setModules(v.id, v.modules),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "modules"] }),
  });
}

export function useInvitePortalUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { clientId: string; request: InviteClientAdminRequest }) =>
      clientPortalApi.inviteUser(v.clientId, v.request),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "users"] }),
  });
}

/**
 * Invites several people to one HRIS client as Client Admins, one request each so a refusal
 * (already a member, a pending invite, ...) only fails that email and is reported with its reason.
 * The portal creates its copy of the client (same id) on the first invite, so nothing has to be
 * set up in the portal beforehand.
 */
export function useInvitePortalUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (v: {
      hrisClient: HrisClientRef;
      recipients: { email: string; fullName: string }[];
    }): Promise<BatchInvitationResult> => {
      const result: BatchInvitationResult = { sent: 0, failed: [] };
      for (const { email, fullName } of v.recipients) {
        try {
          await clientPortalApi.inviteUser(null, {
            email,
            fullName,
            roleIds: [],
            siteIds: [],
            makeClientAdmin: true,
            hrisClient: v.hrisClient,
          });
          result.sent += 1;
        } catch (err) {
          result.failed.push({
            email,
            reason: problemDetail(err, "The invitation could not be sent."),
          });
        }
      }
      return result;
    },
    // The first invite may have created the portal's client, so its list is stale too.
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function usePortalUserAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      v:
        | { kind: "resend"; userId: string }
        | { kind: "reset"; userId: string }
        | { kind: "remove"; userId: string }
        | { kind: "active"; userId: string; active: boolean },
    ): Promise<void> => {
      if (v.kind === "resend") return clientPortalApi.resendInvite(v.userId);
      if (v.kind === "reset") return clientPortalApi.resetAccess(v.userId);
      if (v.kind === "remove") return clientPortalApi.removeUser(v.userId);
      await clientPortalApi.setUserActive(v.userId, v.active);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "users"] }),
  });
}

export function useCreatePortalSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => clientPortalApi.createSource(name),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "sources"] }),
  });
}

export function useRotatePortalSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientPortalApi.rotateSource(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "sources"] }),
  });
}

export function useSetPortalSourceActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; active: boolean }) =>
      clientPortalApi.setSourceActive(v.id, v.active),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "sources"] }),
  });
}

export function usePreviewPortalPeriod() {
  return useMutation({
    mutationFn: (request: VerifyPeriodRequest) =>
      clientPortalApi.previewPeriod(request),
  });
}

export function useVerifyPortalPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: VerifyPeriodRequest) =>
      clientPortalApi.verifyPeriod(request),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "periods"] }),
  });
}

export function useReopenPortalPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientPortalApi.reopenPeriod(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "periods"] }),
  });
}

export function useResolvePortalFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientPortalApi.resolveFlag(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...KEY, "flags"] }),
  });
}
