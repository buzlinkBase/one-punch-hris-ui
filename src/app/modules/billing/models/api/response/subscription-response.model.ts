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
  /** "Storage" for blocks bought mid-period. */
  kind: "Plan" | "Storage";
  /** Storage payments: what was bought, e.g. "2 x 50 GB Storage". */
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
}

/** Why a payment is due: a chosen plan, the next period, or a lapsed plan coming back. */
export type PaymentDueReason = "PlanChange" | "Renewal" | "Reactivation";

export interface PaymentDueResponse {
  planCode: string;
  planName: string;
  billingCycle: BillingCycle;
  /** The whole charge: the plan's price plus `addOnsAmount`, less `creditAmount`. */
  amount: number;
  reason: PaymentDueReason;
  /** The part of `amount` that renews the company's paid storage blocks. */
  addOnsAmount: number;
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

/** What a checkout buys: a period of a plan, or blocks of extra storage. */
export type CheckoutKind = "Plan" | "StorageAddOn";

/** GET subscriptions/checkout/{id}: where an online payment stands. */
export interface CheckoutResponse {
  id: string;
  status: CheckoutStatus;
  kind: CheckoutKind;
  /** The plan's name, or for a storage checkout what was bought ("2 x 50 GB storage block"). */
  planName: string;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  createdAtUtc: string;
  paidAtUtc: string | null;
  paymentMethod: PaymentMethod | null;
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
  /** The plan's full-period price plus `addOnsAmount`. */
  subtotal: number;
  addOnsAmount: number;
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
