import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PlanChangeRequest } from "../models/api/request/plan-change-request.model";
import type {
  ConfirmAutoRenewRequest,
  StartAutoRenewRequest,
} from "../models/api/request/auto-renew-request.model";
import type {
  StorageCycleRequest,
  StoragePurchaseRequest,
  StorageReductionRequest,
} from "../models/api/request/storage-request.model";
import type {
  StorageQuoteResponse,
  StorageStatusResponse,
  StorageSummaryResponse,
} from "../models/api/response/storage-response.model";
import type {
  AutoRenewConfirmedResponse,
  AutoRenewStartedResponse,
  AutoRenewTarget,
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

  /** Turns auto renew on by paying what's due now; returns the payment to complete -- needs Billing:Manage. */
  startAutoRenew(
    payload: StartAutoRenewRequest,
  ): Promise<AutoRenewStartedResponse> {
    return httpClient.postUnwrapped<AutoRenewStartedResponse>(
      `${ENDPOINT}/auto-renew`,
      payload,
    );
  },

  /** Pays auto renew's first invoice with a PayMongo card token or Maya. */
  confirmAutoRenew(
    checkoutId: string,
    payload: ConfirmAutoRenewRequest,
  ): Promise<AutoRenewConfirmedResponse> {
    return httpClient.postUnwrapped<AutoRenewConfirmedResponse>(
      `${ENDPOINT}/auto-renew/${checkoutId}/confirm`,
      payload,
    );
  },

  turnOffAutoRenew(target: AutoRenewTarget): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/auto-renew/${target}`);
  },

  /** Opens the payment gateway's page for the storage renewal now due -- needs Billing:Manage. */
  startStorageRenewalCheckout(): Promise<CheckoutStartedResponse> {
    return httpClient.postUnwrapped<CheckoutStartedResponse>(
      `${ENDPOINT}/storage/renewal/checkout`,
      {},
    );
  },

  /** Switch storage to monthly or annual billing from its next renewal. */
  changeStorageCycle(payload: StorageCycleRequest): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/storage/cycle`, payload);
  },

  withdrawStorageCycleChange(): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/storage/cycle`);
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
