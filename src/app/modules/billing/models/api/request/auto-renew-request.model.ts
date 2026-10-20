import type {
  AutoRenewTarget,
  BillingCycle,
} from "../response/subscription-response.model";

/** Turn auto renew on by paying what's due now (POST subscriptions/auto-renew). */
export interface StartAutoRenewRequest {
  target: AutoRenewTarget;
  /** Storage only: buy blocks that start a new storage period, instead of paying a storage renewal. */
  offeringCode?: string;
  blocks?: number;
  billingCycle?: BillingCycle;
}

export type AutoRenewPaymentMethod = "card" | "maya";

/** Pay the first invoice: a card tokenized by PayMongo in the browser (its pm_ id), or Maya. */
export interface ConfirmAutoRenewRequest {
  method: AutoRenewPaymentMethod;
  paymentMethodId?: string;
}

/** Card details as typed -- sent only to PayMongo, never to our servers. */
export interface CardDetails {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  name: string;
  email?: string;
}
