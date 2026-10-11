import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PlanChangeRequest } from "../models/api/request/plan-change-request.model";
import type {
  StoragePurchaseRequest,
  StorageReductionRequest,
} from "../models/api/request/storage-request.model";
import type {
  StorageQuoteResponse,
  StorageStatusResponse,
  StorageSummaryResponse,
} from "../models/api/response/storage-response.model";
import type {
  BillingResponse,
  CheckoutResponse,
  CheckoutStartedResponse,
  EntitlementsResponse,
  PlanChangeQuoteResponse,
  PlanResponse,
  UsageResponse,
} from "../models/api/response/subscription-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.tenants, "subscriptions");

export const subscriptionApi = {
  /** What the current company may use -- every member can read this. */
  getEntitlements(): Promise<EntitlementsResponse> {
    return httpClient.getUnwrapped<EntitlementsResponse>(
      `${ENDPOINT}/entitlements`,
      { _skipErrorNotification: true },
    );
  },

  /** Plan, status, usage and payments -- needs Billing:View. */
  getCurrent(): Promise<BillingResponse> {
    return httpClient.getUnwrapped<BillingResponse>(`${ENDPOINT}/current`);
  },

  /** Usage per company and the recommended plan -- slow (counts in other services), so loaded apart. */
  getUsage(): Promise<UsageResponse> {
    return httpClient.getUnwrapped<UsageResponse>(`${ENDPOINT}/usage`);
  },

  getPlans(): Promise<PlanResponse[]> {
    return httpClient.getUnwrapped<PlanResponse[]>(`${ENDPOINT}/plans`);
  },

  /** Plan-limit refusals are shown by the caller (with the violations), not as a toast. */
  requestChange(payload: PlanChangeRequest): Promise<PlanChangeQuoteResponse> {
    return httpClient.postUnwrapped<PlanChangeQuoteResponse>(
      `${ENDPOINT}/change`,
      payload,
      { _skipErrorNotification: true },
    );
  },

  withdrawChange(): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/change`);
  },

  cancel(): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/cancel`);
  },

  resume(): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/resume`);
  },

  /** Opens the payment gateway's page for what's due now -- needs Billing:Manage. */
  startCheckout(): Promise<CheckoutStartedResponse> {
    return httpClient.postUnwrapped<CheckoutStartedResponse>(
      `${ENDPOINT}/checkout`,
    );
  },

  /** This company's storage: plan capacity, blocks held, usage, offerings -- needs Billing:View. */
  getStorage(): Promise<StorageSummaryResponse> {
    return httpClient.getUnwrapped<StorageSummaryResponse>(
      `${ENDPOINT}/storage`,
    );
  },

  /** Capacity and usage only, for the warning banners -- also open to the company's Admins. */
  getStorageStatus(): Promise<StorageStatusResponse> {
    return httpClient.getUnwrapped<StorageStatusResponse>(
      `${ENDPOINT}/storage/status`,
      { _skipErrorNotification: true },
    );
  },

  /** The prorated price of more blocks -- needs Billing:Manage. */
  quoteStorage(payload: StoragePurchaseRequest): Promise<StorageQuoteResponse> {
    return httpClient.postUnwrapped<StorageQuoteResponse>(
      `${ENDPOINT}/storage/quote`,
      payload,
    );
  },

  /** Opens the payment gateway's page for the blocks -- needs Billing:Manage. */
  startStorageCheckout(
    payload: StoragePurchaseRequest,
  ): Promise<CheckoutStartedResponse> {
    return httpClient.postUnwrapped<CheckoutStartedResponse>(
      `${ENDPOINT}/storage/checkout`,
      payload,
    );
  },

  requestStorageReduction(payload: StorageReductionRequest): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/storage/reduction`, payload);
  },

  withdrawStorageReduction(addOnId: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/storage/reduction/${addOnId}`);
  },

  /** Where an online payment stands; the server asks the gateway while it's unpaid. */
  getCheckout(checkoutId: string): Promise<CheckoutResponse> {
    return httpClient.getUnwrapped<CheckoutResponse>(
      `${ENDPOINT}/checkout/${checkoutId}`,
      { _skipErrorNotification: true },
    );
  },
};
