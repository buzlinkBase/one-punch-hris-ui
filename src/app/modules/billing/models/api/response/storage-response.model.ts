/** Sizes here are in MB, the unit of the `storage.max_mb` limit. Storage is one pool for the whole account. */

import type {
  AutoRenewResponse,
  BillingCycle,
} from "./subscription-response.model";

export type StorageLevel = "Normal" | "Warning" | "Critical";

/** A block of extra storage the account's owner may buy (TenantApi StorageOfferingView). */
export interface StorageOfferingResponse {
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  blockMb: number;
  /** Per block, for accounts billed monthly. */
  monthlyPrice: number;
  /** Per block, for accounts billed annually. */
  annualPrice: number;
  currency: string;
  pricesIncludeVat: boolean;
  isPublic: boolean;
  isActive: boolean;
}

/** Blocks the account holds (TenantApi StorageAddOnView). */
export interface StorageAddOnResponse {
  id: string;
  offeringCode: string;
  offeringName: string;
  blocks: number;
  blockMb: number;
  /** One block's price for the storage cycle. */
  unitPrice: number;
  /** `blocks` x `unitPrice` per storage cycle. */
  cycleTotal: number;
  isComplimentary: boolean;
  /** Blocks held from `pendingEffectiveAtUtc` on; 0 = cancelled then. */
  pendingBlocks: number | null;
  pendingEffectiveAtUtc: string | null;
  renewsAtUtc: string | null;
}

/** One company's share of the account's storage. */
export interface StorageCompanyUsageResponse {
  tenantId: string;
  companyName: string;
  /** Null when it couldn't be measured. */
  usedMb: number | null;
}

/** Storage's own billing period (TenantApi StorageSubscriptionStatus). */
export type StorageSubscriptionStatus = "Active" | "PastDue" | "Lapsed";

/** "Renewal": the next storage period. "Reactivation": lapsed storage restarting from the day it's paid. */
export type StorageDueReason = "Renewal" | "Reactivation";

export interface StorageRenewalLineResponse {
  name: string;
  amount: number;
  description: string | null;
}

/** What paying storage now buys: one more storage period of every paid block. */
export interface StorageRenewalDueResponse {
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  reason: StorageDueReason;
  blocks: number;
  periodStartUtc: string;
  periodEndUtc: string;
  lineItems: StorageRenewalLineResponse[];
}

/** GET subscriptions/storage (needs Billing:View). */
export interface StorageSummaryResponse {
  /** Plan storage; null = unlimited. */
  baseMb: number | null;
  addOnMb: number;
  /** Plan + blocks; null = unlimited. */
  limitMb: number | null;
  /** All companies together; null when any couldn't be measured. */
  usedMb: number | null;
  availableMb: number | null;
  percentUsed: number | null;
  level: StorageLevel;
  currency: string;
  planName: string;
  /**
   * The storage billing cycle -- independent of the plan's. Before any storage is bought, the plan's
   * cycle (offered as the default for the first purchase).
   */
  billingCycle: BillingCycle;
  /** The cycle the next storage renewal switches to. */
  pendingBillingCycle: BillingCycle | null;
  /** Where the storage period stands; null before any storage is bought. */
  status: StorageSubscriptionStatus | null;
  periodStartUtc: string | null;
  /** The storage due date -- its own, apart from the plan's. */
  periodEndUtc: string | null;
  /** Past due: the extra storage stops counting after this. */
  graceEndsAtUtc: string | null;
  /** Every paid block is being given up: storage ends at `periodEndUtc`. */
  cancelAtPeriodEnd: boolean;
  /** What Pay storage would pay for now; null when nothing is due. */
  renewalDue: StorageRenewalDueResponse | null;
  /** Storage's auto renew, when it's on or being set up. */
  autoRenew: AutoRenewResponse | null;
  /** The paid blocks' price per storage cycle. */
  addOnsTotal: number;
  addOns: StorageAddOnResponse[];
  offerings: StorageOfferingResponse[];
  companies: StorageCompanyUsageResponse[];
  /** False while the storage renewal is unpaid, or the account was suspended by support. */
  canPurchase: boolean;
  /** Why `canPurchase` is false. */
  purchaseBlockedReason: string | null;
  /** The limit once scheduled reductions apply. */
  projectedLimitMb: number | null;
  /** Usage already exceeds `projectedLimitMb`. */
  overProjectedLimit: boolean;
}

/** GET subscriptions/storage/status: capacity and usage only, also for Admins. */
export interface StorageStatusResponse {
  limitMb: number | null;
  usedMb: number | null;
  availableMb: number | null;
  percentUsed: number | null;
  level: StorageLevel;
  canPurchase: boolean;
}

/** POST subscriptions/storage/quote. */
export interface StorageQuoteResponse {
  offeringCode: string;
  offeringName: string;
  blocks: number;
  blockMb: number;
  /** The storage cycle: the running one, or the one chosen for a new storage period. */
  billingCycle: BillingCycle;
  /** One block's price for the storage cycle. */
  unitPrice: number;
  /** Prorated to the storage due date, or a full period when `startsNewPeriod`. */
  amountDue: number;
  currency: string;
  pricesIncludeVat: boolean;
  periodStartUtc: string;
  periodEndUtc: string;
  daysRemaining: number;
  /** All paid blocks per storage cycle once this purchase is in. */
  newAddOnsTotal: number;
  /** -1 = unlimited. */
  newLimitMb: number;
  /** No storage period was running: this purchase starts one, at the full period's price. */
  startsNewPeriod: boolean;
}
