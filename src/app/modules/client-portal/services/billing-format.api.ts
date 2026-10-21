import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { InvoiceDetail } from "../models/api/response/client-portal-response.model";
import type {
  Arrangement,
  ArrangementRateRequest,
  ArrangementRequest,
  AttachmentRequest,
  BillingAdjustment,
  BillingDocument,
  BillingFormat,
  BillingFormatRequest,
  BillingFormatSummary,
  BillingRun,
  BillingRunPreview,
  BillingRunRequest,
  CreateBillingAdjustmentRequest,
  FormatCatalog,
  InvoiceAttachment,
  NumberSeries,
  NumberSeriesRequest,
  PostOption,
} from "../models/api/billing-format.model";

const base = (resource: string) =>
  buildApiUrl(API_PREFIX.clientPortal, resource);

/** Billing formats, numbering, client arrangements, billing runs and the billing packet of an invoice. */
export const billingFormatApi = {
  catalog(): Promise<FormatCatalog> {
    return httpClient.getUnwrapped(base("billing-formats/catalog"));
  },

  listFormats(): Promise<BillingFormatSummary[]> {
    return httpClient.getUnwrapped(base("billing-formats"));
  },

  getFormat(id: string): Promise<BillingFormat> {
    return httpClient.getUnwrapped(base(`billing-formats/${id}`));
  },

  updateFormat(
    id: string,
    request: BillingFormatRequest,
  ): Promise<BillingFormat> {
    return httpClient.putUnwrapped(base(`billing-formats/${id}`), request);
  },

  cloneFormat(id: string, name: string): Promise<BillingFormat> {
    return httpClient.postUnwrapped(base(`billing-formats/${id}/clone`), {
      name,
    });
  },

  setFormatActive(id: string, active: boolean): Promise<BillingFormat> {
    return httpClient.putUnwrapped(base(`billing-formats/${id}/active`), {
      active,
    });
  },

  listSeries(): Promise<NumberSeries[]> {
    return httpClient.getUnwrapped(base("number-series"));
  },

  saveSeries(
    id: string | null,
    request: NumberSeriesRequest,
  ): Promise<NumberSeries> {
    return id
      ? httpClient.putUnwrapped(base(`number-series/${id}`), request)
      : httpClient.postUnwrapped(base("number-series"), request);
  },

  listArrangements(clientId: string): Promise<Arrangement[]> {
    return httpClient.getUnwrapped(base("billing/arrangements"), {
      params: { clientId },
    });
  },

  listPosts(clientId: string): Promise<PostOption[]> {
    return httpClient.getUnwrapped(base("billing/arrangements/posts"), {
      params: { clientId },
    });
  },

  saveArrangement(
    clientId: string,
    id: string | null,
    request: ArrangementRequest,
  ): Promise<Arrangement> {
    return id
      ? httpClient.putUnwrapped(base(`billing/arrangements/${id}`), request)
      : httpClient.postUnwrapped(base("billing/arrangements"), request, {
          params: { clientId },
        });
  },

  addArrangementRate(
    groupId: string,
    request: ArrangementRateRequest,
  ): Promise<Arrangement> {
    return httpClient.postUnwrapped(
      base(`billing/arrangements/groups/${groupId}/rates`),
      request,
    );
  },

  previewRun(request: BillingRunRequest): Promise<BillingRunPreview> {
    return httpClient.postUnwrapped(base("billing-runs/preview"), request);
  },

  generateRun(request: BillingRunRequest): Promise<BillingRun> {
    return httpClient.postUnwrapped(base("billing-runs"), request);
  },

  listRuns(clientId: string): Promise<BillingRun[]> {
    return httpClient.getUnwrapped(base("billing-runs"), {
      params: { clientId },
    });
  },

  listAdjustments(clientId: string): Promise<BillingAdjustment[]> {
    return httpClient.getUnwrapped(base("billing/adjustments"), {
      params: { clientId },
    });
  },

  createAdjustment(
    request: CreateBillingAdjustmentRequest,
  ): Promise<BillingAdjustment> {
    return httpClient.postUnwrapped(base("billing/adjustments"), request);
  },

  cancelAdjustment(id: string): Promise<BillingAdjustment> {
    return httpClient.postUnwrapped(base(`billing/adjustments/${id}/cancel`));
  },

  setInvoiceNumber(id: string, number: string): Promise<InvoiceDetail> {
    return httpClient.putUnwrapped(base(`invoices/${id}/number`), { number });
  },

  invoiceDocument(id: string): Promise<BillingDocument> {
    return httpClient.getUnwrapped(base(`invoices/${id}/document`));
  },

  listAttachments(invoiceId: string): Promise<InvoiceAttachment[]> {
    return httpClient.getUnwrapped(base(`invoices/${invoiceId}/attachments`));
  },

  uploadAttachment(
    invoiceId: string,
    form: FormData,
  ): Promise<InvoiceAttachment> {
    return httpClient.postUnwrapped(
      base(`invoices/${invoiceId}/attachments`),
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  updateAttachment(
    id: string,
    request: AttachmentRequest,
  ): Promise<InvoiceAttachment> {
    return httpClient.putUnwrapped(base(`invoices/attachments/${id}`), request);
  },

  removeAttachment(id: string): Promise<void> {
    return httpClient
      .delete<unknown>(base(`invoices/attachments/${id}`))
      .then(() => undefined);
  },
};
