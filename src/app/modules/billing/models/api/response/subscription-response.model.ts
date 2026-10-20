export type SubscriptionStatus =
  | "Trialing"
  | "Active"
  | "PastDue"
  | "Suspended"
  | "Expired"
  | "Canceled"
  | "None"
  | "Unrestricted"
  | "Unowned"
  | "Unavailable"
  /** The company is still setting up and its owner has no plan yet -- full access. */
  | "Provisioning"
  /** The company was deleted. */
  | "Invalid";

export type AccessMode = "Full" | "ReadOnly";

export type BillingCycle = "Monthly" | "Annual";

export type PlanChangeTiming = "OnPayment" | "AtPeriodEnd";

export type AccessRestrictionKind = "Suspended" | "LegalHold";

/**
 * An operator stopped the whole account, the owner included. `reason` is only sent to the owner
 * and billing admins; other members get null and are just told the account is unavailable.
 */
export interface AccessRestriction {
  kind: AccessRestrictionKind;
  reason: string | null;
}

/** One company's effective entitlements (TenantApi EntitlementSnapshot). Dates are UTC ISO. */
export interface EntitlementSnapshot {
  tenantId: string;
  ownerUserId: string | null;
  planCode: string | null;
  planName: string | null;
  status: SubscriptionStatus;
  accessMode: AccessMode;
  features: Record<string, boolean>;
  /** Limit key -> maximum; -1 = unlimited. */
  limits: Record<string, number>;
  /** Entitlement key -> "plan" | "account-override" | "company-override". */
  sources: Record<string, string>;
  supportTier: string | null;
  trialEndsAtUtc: string | null;
  currentPeriodEndUtc: string | null;
  graceEndsAtUtc: string | null;
  cancelAtPeriodEnd: boolean;
  /** Set while the account is suspended or on legal hold by an operator. */
  restriction?: AccessRestriction | null;
}

export interface EntitlementsResponse {
  entitlements: EntitlementSnapshot;
  /** Feature key -> name of the lowest plan that includes it. */
  featureAvailableOn: Record<string, string>;
}

export interface PlanResponse {
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  isRecommended: boolean;
  isPublic: boolean;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  pricesIncludeVat: boolean;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  supportTier: string | null;
}

export interface PendingChangeResponse {
  planCode: string;
  planName: string;
  billingCycle: BillingCycle;
  timing: PlanChangeTiming;
  effectiveAtUtc: string | null;
  /** An upgrade waiting for payment: net of `creditAmount`. */
  amountDue: number;
  /** An upgrade's credit for the unused days of the running period. */
  creditAmount: number;
  unusedDays: number;
}

export interface CompanyUsageResponse {
  tenantId: string;
  name: string;
  /** Limit key -> used; null when it couldn't be counted. */
  used: Record<string, number | null>;
  /** Limit key -> maximum; null = unlimited. */
  max: Record<string, number | null>;
}

/** TenantApi PaymentMethod -- QrPh to BillEase only come from online checkout; Credit is an upgrade the unused time paid for. */
export type PaymentMethod =
  | "BankTransfer"
  | "Cash"
  | "Check"
  | "GCash"
  | "Maya"
  | "Card"
  | "Other"
  | "QrPh"
  | "GrabPay"
  | "ShopeePay"
  | "OnlineBanking"
  | "BillEase"
  | "Credit";

export interface PaymentResponse {
  id: string;
  paidAtUtc: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference: string | null;
  planName: string | null;
  billingCycle: BillingCycle;
  periodStartUtc: string;
  periodEndUtc: string;
  /** "Storage" for blocks bought, "StorageRenewal" for a storage period -- billed apart from the plan. */
  kind: "Plan" | "Storage" | "StorageRenewal";
  /** Storage payments: what was paid for, e.g. "2 x 50 GB Storage". */
  description: string | null;
  /** "Refunded" / "Cancelled" for a voided payment that stays in the history; "Paid" otherwise. */
  status: PaymentStatus;
  /** How much has gone back to the payer; set even before the payment is voided. */
  refundedAmount: number;
  /** Point-in-time itemized amounts; null for payments made before itemization was recorded. */
  lineItems: PaymentLineItemResponse[] | null;
  /** The unused time of the previous plan put towards this period on an upgrade. */
  creditAmount: number;
}

export interface PaymentLineItemResponse {
  name: string;
  amount: number;
  description: string | null;
}

/** "PartiallyRefunded": some was refunded but the payment still counts. "Refunded"/"Cancelled": voided or fully refunded. */
export type PaymentStatus =
  "Paid" | "PartiallyRefunded" | "Refunded" | "Cancelled";

/**
 * Usage per company and the recommended plan (TenantApi UsageView). Apart from `BillingResponse`
 * because counting asks other services and is slow -- it's loaded after the rest of the screen.
 */
export interface UsageResponse {
  companies: CompanyUsageResponse[];
  /** The cheapest plan covering what the account used and fitting its usage. */
  recommendedPlanCode: string | null;
}

/** The billing screen (TenantApi BillingView). */
export interface BillingResponse {
  entitlements: EntitlementSnapshot;
  billingCycle: BillingCycle | null;
  currentPeriodStartUtc: string | null;
  purgeAfterUtc: string | null;
  trialDays: number;
  trialDay: number | null;
  trialExtended: boolean;
  pendingChange: PendingChangeResponse | null;
  nextAmountDue: number | null;
  currency: string;
  companiesUsed: number;
  companiesMax: number | null;
  payments: PaymentResponse[];
  paymentInstructions: string;
  /** What Pay now would pay for; null when nothing is due. */
  paymentDue: PaymentDueResponse | null;
  /** Whether online payment (PayMongo) is set up on the server. */
  onlinePaymentEnabled: boolean;
  /** Auto renews that are on (or being set up), one per target at most. */
  autoRenew: AutoRenewResponse[];
}

/** What an auto renew pays for: the plan, or the storage blocks (billed apart from the plan). */
export type AutoRenewTarget = "Plan" | "Storage";

export type AutoRenewStatus = "Pending" | "Active" | "PastDue" | "Canceled";

/** An auto renew: PayMongo charges the saved card or Maya account every cycle (TenantApi AutoRenewView). */
export interface AutoRenewResponse {
  target: AutoRenewTarget;
  status: AutoRenewStatus;
  billingCycle: BillingCycle;
  /** "Visa •••• 4242", "Maya" -- never more of the card than that. */
  paymentMethodLabel: string | null;
  activatedAtUtc: string | null;
  nextChargeAtUtc: string | null;
  lastFailureAtUtc: string | null;
  lastFailureReason: string | null;
  canceledAtUtc: string | null;
  cancelReason: string | null;
}

/** POST subscriptions/auto-renew: the first payment to complete, which saves the card or Maya account. */
export interface AutoRenewStartedResponse {
  checkoutId: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  /** For handing card details straight to PayMongo from the browser; null: card isn't offered. */
  publicKey: string | null;
}

/** POST subscriptions/auto-renew/{checkoutId}/confirm. */
export interface AutoRenewConfirmedResponse {
  checkoutId: string;
  /** Where the payer authorizes the payment (3-D Secure, the Maya app); null when it's already done. */
  redirectUrl: string | null;
  status: CheckoutStatus;
}

/** Why a payment is due: a chosen plan, the next period, or a lapsed plan coming back. */
export type PaymentDueReason = "PlanChange" | "Renewal" | "Reactivation";

export interface PaymentDueResponse {
  planCode: string;
  planName: string;
  billingCycle: BillingCycle;
  /** The whole charge: the plan's price less `creditAmount`. Storage is billed on its own. */
  amount: number;
  reason: PaymentDueReason;
  /** An upgrade's credit for the unused days of the running period, already taken off `amount`. */
  creditAmount: number;
  unusedDays: number;
}

/** POST subscriptions/checkout: the payment page to send the browser to. */
export interface CheckoutStartedResponse {
  checkoutId: string;
  checkoutUrl: string;
}

export type CheckoutStatus = "Open" | "Paid" | "Expired" | "Failed";

/** What a checkout buys: a period of a plan, blocks of extra storage, or a storage period. */
export type CheckoutKind = "Plan" | "StorageAddOn" | "StorageRenewal";

/** GET subscriptions/checkout/{id}: where an online payment stands. */
export interface CheckoutResponse {
  id: string;
  status: CheckoutStatus;
  kind: CheckoutKind;
  /**
   * The plan's name, or for a storage checkout what was paid for ("2 x 50 GB storage block",
   * "Storage renewal (monthly), 2 blocks").
   */
  planName: string;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  createdAtUtc: string;
  paidAtUtc: string | null;
  paymentMethod: PaymentMethod | null;
  /** It paid the first invoice of an auto renew: once paid, it renews by itself. */
  autoRenew: boolean;
}

export interface PlanChangeQuoteResponse {
  planCode: string;
  planName: string;
  billingCycle: BillingCycle;
  timing: PlanChangeTiming;
  effectiveAtUtc: string | null;
  /** What's left to pay: `subtotal` less `creditAmount`. */
  amountDue: number;
  currency: string;
  pricesIncludeVat: boolean;
  /** The plan's full-period price. */
  subtotal: number;
  /** An upgrade's credit for the unused days of the period already paid for. */
  creditAmount: number;
  unusedDays: number;
  /** The credit covered the whole price: the plan was switched right away. */
  appliedImmediately: boolean;
  /** When the new plan's first period ends once paid (extra days from leftover credit included). */
  periodEndUtc: string | null;
}

/** One limit a downgrade would exceed (409 plan-limit-reached). */
export interface LimitViolation {
  limitKey: string;
  tenantId: string | null;
  companyName: string | null;
  used: number;
  max: number | null;
}
