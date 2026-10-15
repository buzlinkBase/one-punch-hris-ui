import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  AllocationRequest,
  CreateClientRequest,
  GenerateInvoiceRequest,
  InviteClientAdminRequest,
  PortalConnectionRequest,
  RateRequest,
  RecordPaymentRequest,
  VerifyPeriodRequest,
} from "../models/api/request/client-portal-request.model";
import type {
  AgingReport,
  BillingDashboard,
  BillingProfile,
  BillingSummaryRow,
  BlockingRecord,
  Cert2307,
  CheckStatus,
  ClientFlag,
  CollectionNote,
  CollectionsReport,
  ContractRate,
  DisputeDetail,
  DisputeSummary,
  GuardDocument,
  GuardVaultRow,
  HistoryEntry,
  ManpowerRequestRow,
  PortalNotice,
  Scorecard,
  Memo,
  Missing2307Row,
  OverdueRow,
  Statement,
  DeliveryMode,
  DtrPeriod,
  IntegrationSource,
  IntegrationSourceKey,
  InvoiceDetail,
  InvoicePage,
  Payment,
  PortalClient,
  PortalClientUser,
  PortalConnection,
  PortalModuleSwitches,
  PortalSite,
} from "../models/api/response/client-portal-response.model";

const base = (resource: string) =>
  buildApiUrl(API_PREFIX.clientPortal, resource);

/** This company's own connection settings live in hrms-api, not in the portal. */
const connection = (resource: string) =>
  buildApiUrl(API_PREFIX.hrms, `clientportal/${resource}`);

export const clientPortalApi = {
  getConnection(): Promise<PortalConnection> {
    return httpClient.getUnwrapped(connection("settings"));
  },

  saveConnection(request: PortalConnectionRequest): Promise<PortalConnection> {
    return httpClient.putUnwrapped(connection("settings"), request);
  },

  resendBatch(dtrBatchId: string): Promise<void> {
    return httpClient.postUnwrapped(connection(`sync/${dtrBatchId}`));
  },

  listClients(): Promise<PortalClient[]> {
    return httpClient.getUnwrapped(base("clients"));
  },

  createClient(request: CreateClientRequest): Promise<PortalClient> {
    return httpClient.postUnwrapped(base("clients"), request);
  },

  setClientActive(id: string, active: boolean): Promise<PortalClient> {
    return httpClient.putUnwrapped(base(`clients/${id}/active`), { active });
  },

  getModules(id: string): Promise<PortalModuleSwitches> {
    return httpClient.getUnwrapped(base(`clients/${id}/modules`));
  },

  setModules(
    id: string,
    modules: PortalModuleSwitches,
  ): Promise<PortalModuleSwitches> {
    return httpClient.putUnwrapped(base(`clients/${id}/modules`), { modules });
  },

  listSites(clientId: string): Promise<PortalSite[]> {
    return httpClient.getUnwrapped(base("sites"), { params: { clientId } });
  },

  listUsers(clientId: string): Promise<PortalClientUser[]> {
    return httpClient.getUnwrapped(base("users"), { params: { clientId } });
  },

  inviteUser(
    clientId: string,
    request: InviteClientAdminRequest,
  ): Promise<PortalClientUser> {
    return httpClient.postUnwrapped(base("users/invite"), request, {
      params: { clientId },
    });
  },

  resendInvite(userId: string): Promise<void> {
    return httpClient.postUnwrapped(base(`users/${userId}/resend-invite`));
  },

  resetAccess(userId: string): Promise<void> {
    return httpClient.postUnwrapped(base(`users/${userId}/reset-access`));
  },

  setUserActive(userId: string, active: boolean): Promise<PortalClientUser> {
    return httpClient.putUnwrapped(base(`users/${userId}/active`), { active });
  },

  listSources(): Promise<IntegrationSource[]> {
    return httpClient.getUnwrapped(base("integration-sources"));
  },

  createSource(name: string): Promise<IntegrationSourceKey> {
    return httpClient.postUnwrapped(base("integration-sources"), { name });
  },

  rotateSource(id: string): Promise<IntegrationSourceKey> {
    return httpClient.postUnwrapped(base(`integration-sources/${id}/rotate`));
  },

  setSourceActive(id: string, active: boolean): Promise<IntegrationSource> {
    return httpClient.putUnwrapped(base(`integration-sources/${id}/active`), {
      active,
    });
  },

  listPeriods(clientId: string): Promise<DtrPeriod[]> {
    return httpClient.getUnwrapped(base("dtr-periods"), {
      params: { clientId },
    });
  },

  previewPeriod(request: VerifyPeriodRequest): Promise<BlockingRecord[]> {
    return httpClient.postUnwrapped(base("dtr-periods/preview"), request);
  },

  verifyPeriod(request: VerifyPeriodRequest): Promise<DtrPeriod> {
    return httpClient.postUnwrapped(base("dtr-periods/verify"), request);
  },

  reopenPeriod(id: string): Promise<void> {
    return httpClient
      .delete<unknown>(base(`dtr-periods/${id}`))
      .then(() => undefined);
  },

  // ---- operations: vault, notices, scorecard, manpower ----
  vaultGuards(clientId?: string): Promise<GuardVaultRow[]> {
    return httpClient.getUnwrapped(base("vault/guards"), {
      params: { clientId },
    });
  },

  vaultDocuments(
    clientId?: string,
    guardId?: string,
  ): Promise<GuardDocument[]> {
    return httpClient.getUnwrapped(base("vault/documents"), {
      params: { clientId, guardId },
    });
  },

  vaultExpiring(
    withinDays: number,
    clientId?: string,
  ): Promise<GuardDocument[]> {
    return httpClient.getUnwrapped(base("vault/expiring"), {
      params: { withinDays, clientId },
    });
  },

  uploadVaultDocument(form: FormData): Promise<GuardDocument> {
    return httpClient.postUnwrapped(base("vault/documents"), form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteVaultDocument(id: string): Promise<void> {
    return httpClient
      .delete<unknown>(base(`vault/documents/${id}`))
      .then(() => undefined);
  },

  listNotices(): Promise<PortalNotice[]> {
    return httpClient.getUnwrapped(base("notices"));
  },

  saveNotice(
    id: string | null,
    body: {
      clientId: string | null;
      title: string;
      body: string;
      pinned: boolean;
      publishAt: string | null;
      expiresAt: string | null;
    },
  ): Promise<PortalNotice> {
    return id
      ? httpClient.putUnwrapped(base(`notices/${id}`), body)
      : httpClient.postUnwrapped(base("notices"), body);
  },

  deleteNotice(id: string): Promise<void> {
    return httpClient
      .delete<unknown>(base(`notices/${id}`))
      .then(() => undefined);
  },

  scorecard(clientId?: string, from?: string, to?: string): Promise<Scorecard> {
    return httpClient.getUnwrapped(base("ratings/scorecard"), {
      params: { clientId, from, to },
    });
  },

  listManpower(
    clientId?: string,
    status?: string,
  ): Promise<ManpowerRequestRow[]> {
    return httpClient.getUnwrapped(base("manpower"), {
      params: { clientId, status },
    });
  },

  dispatchManpower(id: string): Promise<ManpowerRequestRow> {
    return httpClient.postUnwrapped(base(`manpower/${id}/dispatch`));
  },

  vaultAlertSettings(): Promise<{ emails: string }> {
    return httpClient.getUnwrapped(base("vault/alert-settings"));
  },

  saveVaultAlertSettings(emails: string): Promise<{ emails: string }> {
    return httpClient.putUnwrapped(base("vault/alert-settings"), { emails });
  },

  decideManpower(
    id: string,
    body: { approve: boolean; note: string | null },
  ): Promise<ManpowerRequestRow> {
    return httpClient.postUnwrapped(base(`manpower/${id}/decide`), body);
  },

  // ---- collections, reports, disputes, memos, 2307, statements ----
  listOverdue(clientId?: string): Promise<OverdueRow[]> {
    return httpClient.getUnwrapped(base("collections/overdue"), {
      params: { clientId },
    });
  },

  listNotes(invoiceId: string): Promise<CollectionNote[]> {
    return httpClient.getUnwrapped(
      base(`collections/invoices/${invoiceId}/notes`),
    );
  },

  addNote(
    invoiceId: string,
    body: {
      kind: string;
      contact: string;
      note: string;
      promisedDate: string | null;
    },
  ): Promise<CollectionNote> {
    return httpClient.postUnwrapped(
      base(`collections/invoices/${invoiceId}/notes`),
      body,
    );
  },

  invoiceHistory(invoiceId: string): Promise<HistoryEntry[]> {
    return httpClient.getUnwrapped(
      base(`collections/invoices/${invoiceId}/history`),
    );
  },

  dashboard(clientId?: string): Promise<BillingDashboard> {
    return httpClient.getUnwrapped(base("reports/dashboard"), {
      params: { clientId },
    });
  },

  aging(clientId?: string): Promise<AgingReport> {
    return httpClient.getUnwrapped(base("reports/aging"), {
      params: { clientId },
    });
  },

  collectionsReport(
    from: string,
    to: string,
    clientId?: string,
  ): Promise<CollectionsReport> {
    return httpClient.getUnwrapped(base("reports/collections"), {
      params: { from, to, clientId },
    });
  },

  billingSummary(from: string, to: string): Promise<BillingSummaryRow[]> {
    return httpClient.getUnwrapped(base("reports/billing-summary"), {
      params: { from, to },
    });
  },

  missing2307(clientId?: string): Promise<Missing2307Row[]> {
    return httpClient.getUnwrapped(base("reports/missing-2307"), {
      params: { clientId },
    });
  },

  listDisputes(clientId?: string, status?: string): Promise<DisputeSummary[]> {
    return httpClient.getUnwrapped(base("disputes"), {
      params: { clientId, status },
    });
  },

  getDispute(id: string): Promise<DisputeDetail> {
    return httpClient.getUnwrapped(base(`disputes/${id}`));
  },

  commentDispute(id: string, body: string): Promise<DisputeDetail> {
    return httpClient.postUnwrapped(base(`disputes/${id}/comments`), { body });
  },

  reviewDispute(id: string): Promise<DisputeDetail> {
    return httpClient.postUnwrapped(base(`disputes/${id}/review`));
  },

  resolveDispute(
    id: string,
    body: { accept: boolean; outcome: string; creditSubtotal: number | null },
  ): Promise<DisputeDetail> {
    return httpClient.postUnwrapped(base(`disputes/${id}/resolve`), body);
  },

  createMemo(body: {
    invoiceId: string;
    kind: "Credit" | "Debit";
    subtotal: number;
    reason: string;
  }): Promise<Memo> {
    return httpClient.postUnwrapped(base("memos"), body);
  },

  list2307(invoiceId: string): Promise<Cert2307[]> {
    return httpClient.getUnwrapped(base("withholding"), {
      params: { invoiceId },
    });
  },

  upload2307(form: FormData): Promise<Cert2307> {
    return httpClient.postUnwrapped(base("withholding"), form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  statement(clientId: string, from: string, to: string): Promise<Statement> {
    return httpClient.getUnwrapped(base("statements"), {
      params: { clientId, from, to },
    });
  },

  emailStatement(
    clientId: string,
    from: string,
    to: string,
  ): Promise<{ sentTo: number }> {
    return httpClient.postUnwrapped(base("statements/email"), undefined, {
      params: { clientId, from, to },
    });
  },

  // ---- billing ----
  getProfile(clientId: string): Promise<BillingProfile> {
    return httpClient.getUnwrapped(base("billing/profile"), {
      params: { clientId },
    });
  },

  saveProfile(
    clientId: string,
    profile: BillingProfile,
  ): Promise<BillingProfile> {
    return httpClient.putUnwrapped(base("billing/profile"), profile, {
      params: { clientId },
    });
  },

  listRates(clientId: string): Promise<ContractRate[]> {
    return httpClient.getUnwrapped(base("billing/rates"), {
      params: { clientId },
    });
  },

  addRate(clientId: string, request: RateRequest): Promise<ContractRate> {
    return httpClient.postUnwrapped(base("billing/rates"), request, {
      params: { clientId },
    });
  },

  listInvoices(query: {
    clientId?: string;
    status?: string;
    search?: string;
    page: number;
    pageSize: number;
  }): Promise<InvoicePage> {
    return httpClient.getUnwrapped(base("invoices"), { params: query });
  },

  getInvoice(id: string): Promise<InvoiceDetail> {
    return httpClient.getUnwrapped(base(`invoices/${id}`));
  },

  generateInvoice(request: GenerateInvoiceRequest): Promise<InvoiceDetail> {
    return httpClient.postUnwrapped(base("invoices/generate"), request);
  },

  uploadInvoice(form: FormData): Promise<InvoiceDetail> {
    return httpClient.postUnwrapped(base("invoices/upload"), form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  replaceInvoiceFile(id: string, form: FormData): Promise<InvoiceDetail> {
    return httpClient.putUnwrapped(base(`invoices/${id}/file`), form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  addAdjustment(
    id: string,
    body: { description: string; amount: number; reason: string },
  ): Promise<InvoiceDetail> {
    return httpClient.postUnwrapped(base(`invoices/${id}/adjustments`), body);
  },

  removeAdjustment(id: string, lineId: string): Promise<InvoiceDetail> {
    return httpClient
      .delete<{
        data: InvoiceDetail;
      }>(base(`invoices/${id}/adjustments/${lineId}`))
      .then((r) => r.data);
  },

  setDelivery(
    id: string,
    body: { mode: DeliveryMode; showInPortal: boolean },
  ): Promise<InvoiceDetail> {
    return httpClient.putUnwrapped(base(`invoices/${id}/delivery`), body);
  },

  invoiceStep(
    id: string,
    step: "submit" | "approve" | "issue",
  ): Promise<InvoiceDetail> {
    return httpClient.postUnwrapped(base(`invoices/${id}/${step}`));
  },

  resendInvoice(id: string, extraEmails: string[]): Promise<InvoiceDetail> {
    return httpClient.postUnwrapped(base(`invoices/${id}/resend`), {
      extraEmails,
    });
  },

  voidInvoice(id: string, reason: string): Promise<InvoiceDetail> {
    return httpClient.postUnwrapped(base(`invoices/${id}/void`), { reason });
  },

  /** A protected file as a blob; the token travels in the request header, so it cannot be a plain link. */
  fetchBlob(path: string): Promise<Blob> {
    return httpClient.get<Blob>(base(path), { responseType: "blob" });
  },

  listPayments(
    clientId: string | undefined,
    status: string | undefined,
  ): Promise<Payment[]> {
    return httpClient.getUnwrapped(base("payments"), {
      params: { clientId, status },
    });
  },

  recordPayment(request: RecordPaymentRequest): Promise<Payment> {
    return httpClient.postUnwrapped(base("payments"), request);
  },

  confirmPayment(
    id: string,
    body: {
      receiptNumber: string | null;
      allocations: AllocationRequest[] | null;
    },
  ): Promise<Payment> {
    return httpClient.postUnwrapped(base(`payments/${id}/confirm`), body);
  },

  rejectPayment(id: string, reason: string): Promise<Payment> {
    return httpClient.postUnwrapped(base(`payments/${id}/reject`), { reason });
  },

  setCheckStatus(id: string, status: CheckStatus): Promise<Payment> {
    return httpClient.putUnwrapped(base(`payments/${id}/check-status`), {
      status,
    });
  },

  listFlags(clientId: string, includeResolved: boolean): Promise<ClientFlag[]> {
    return httpClient.getUnwrapped(base("dtr/flags"), {
      params: { clientId, includeResolved },
    });
  },

  resolveFlag(id: string): Promise<void> {
    return httpClient
      .put<unknown>(base(`dtr/flags/${id}/resolve`))
      .then(() => undefined);
  },
};
