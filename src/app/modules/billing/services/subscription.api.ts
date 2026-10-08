import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PlanChangeRequest } from "../models/api/request/plan-change-request.model";
import type {
  BillingResponse,
  CheckoutResponse,
  CheckoutStartedResponse,
  EntitlementsResponse,
  PlanChangeQuoteResponse,
  PlanResponse,
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

  /** Where an online payment stands; the server asks the gateway while it's unpaid. */
  getCheckout(checkoutId: string): Promise<CheckoutResponse> {
    return httpClient.getUnwrapped<CheckoutResponse>(
      `${ENDPOINT}/checkout/${checkoutId}`,
      { _skipErrorNotification: true },
    );
  },
};
