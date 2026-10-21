import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingFormatApi } from "../services/billing-format.api";
import type {
  ArrangementRateRequest,
  ArrangementRequest,
  AttachmentRequest,
  BillingFormatRequest,
  BillingRunRequest,
  CreateBillingAdjustmentRequest,
  NumberSeriesRequest,
} from "../models/api/billing-format.model";

const KEY = ["client-portal"] as const;

/** Refreshes what a billing change can touch: formats, arrangements, runs and the invoices they made. */
function useBillingMutation<TArgs, TResult>(
  run: (args: TArgs) => Promise<TResult>,
  ...areas: string[]
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: async () => {
      for (const area of areas) {
        await queryClient.invalidateQueries({ queryKey: [...KEY, area] });
      }
    },
  });
}

// ---- formats ----

export function useFormatCatalog() {
  return useQuery({
    queryKey: [...KEY, "format-catalog"],
    queryFn: () => billingFormatApi.catalog(),
    staleTime: Infinity,
  });
}

export function useBillingFormats() {
  return useQuery({
    queryKey: [...KEY, "billing-formats"],
    queryFn: () => billingFormatApi.listFormats(),
  });
}

export function useBillingFormat(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "billing-formats", id],
    queryFn: () => billingFormatApi.getFormat(id!),
    enabled: !!id,
  });
}

export const useUpdateFormat = () =>
  useBillingMutation(
    (v: { id: string; request: BillingFormatRequest }) =>
      billingFormatApi.updateFormat(v.id, v.request),
    "billing-formats",
  );

export const useCloneFormat = () =>
  useBillingMutation(
    (v: { id: string; name: string }) =>
      billingFormatApi.cloneFormat(v.id, v.name),
    "billing-formats",
  );

export const useSetFormatActive = () =>
  useBillingMutation(
    (v: { id: string; active: boolean }) =>
      billingFormatApi.setFormatActive(v.id, v.active),
    "billing-formats",
  );

// ---- number series ----

export function useNumberSeries() {
  return useQuery({
    queryKey: [...KEY, "number-series"],
    queryFn: () => billingFormatApi.listSeries(),
  });
}

export const useSaveNumberSeries = () =>
  useBillingMutation(
    (v: { id: string | null; request: NumberSeriesRequest }) =>
      billingFormatApi.saveSeries(v.id, v.request),
    "number-series",
  );

// ---- arrangements ----

export function useArrangements(clientId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "arrangements", clientId],
    queryFn: () => billingFormatApi.listArrangements(clientId!),
    enabled: !!clientId,
  });
}

export function useClientPosts(clientId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "posts", clientId],
    queryFn: () => billingFormatApi.listPosts(clientId!),
    enabled: !!clientId,
  });
}

export const useSaveArrangement = () =>
  useBillingMutation(
    (v: { clientId: string; id: string | null; request: ArrangementRequest }) =>
      billingFormatApi.saveArrangement(v.clientId, v.id, v.request),
    "arrangements",
    "billing-formats",
  );

export const useAddArrangementRate = () =>
  useBillingMutation(
    (v: { groupId: string; request: ArrangementRateRequest }) =>
      billingFormatApi.addArrangementRate(v.groupId, v.request),
    "arrangements",
  );

// ---- billing runs ----

export const usePreviewRun = () =>
  useMutation({
    mutationFn: (request: BillingRunRequest) =>
      billingFormatApi.previewRun(request),
  });

export const useGenerateRun = () =>
  useBillingMutation(
    (request: BillingRunRequest) => billingFormatApi.generateRun(request),
    "billing-runs",
    "invoices",
    "number-series",
    "billing-adjustments",
  );

export function useBillingRuns(clientId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "billing-runs", clientId],
    queryFn: () => billingFormatApi.listRuns(clientId!),
    enabled: !!clientId,
  });
}

// ---- carried-over adjustments ----

export function useBillingAdjustments(clientId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "billing-adjustments", clientId],
    queryFn: () => billingFormatApi.listAdjustments(clientId!),
    enabled: !!clientId,
  });
}

export const useCreateAdjustment = () =>
  useBillingMutation(
    (request: CreateBillingAdjustmentRequest) =>
      billingFormatApi.createAdjustment(request),
    "billing-adjustments",
  );

export const useCancelAdjustment = () =>
  useBillingMutation(
    (id: string) => billingFormatApi.cancelAdjustment(id),
    "billing-adjustments",
  );

// ---- invoice number, document and attachments ----

export const useSetInvoiceNumber = () =>
  useBillingMutation(
    (v: { id: string; number: string }) =>
      billingFormatApi.setInvoiceNumber(v.id, v.number),
    "invoice",
    "invoices",
  );

export function useInvoiceAttachments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "invoice-attachments", invoiceId],
    queryFn: () => billingFormatApi.listAttachments(invoiceId!),
    enabled: !!invoiceId,
  });
}

export const useUploadAttachment = () =>
  useBillingMutation(
    (v: { invoiceId: string; form: FormData }) =>
      billingFormatApi.uploadAttachment(v.invoiceId, v.form),
    "invoice-attachments",
    "invoice",
  );

export const useUpdateAttachment = () =>
  useBillingMutation(
    (v: { id: string; request: AttachmentRequest }) =>
      billingFormatApi.updateAttachment(v.id, v.request),
    "invoice-attachments",
  );

export const useRemoveAttachment = () =>
  useBillingMutation(
    (id: string) => billingFormatApi.removeAttachment(id),
    "invoice-attachments",
    "invoice",
  );
