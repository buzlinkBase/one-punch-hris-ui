/** Sizes here are in MB, the unit of the `storage.max_mb` limit. Storage is one pool for the whole account. */

import type { BillingCycle } from "./subscription-response.model";

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
  /** One block's price for the account's billing cycle. */
  unitPrice: number;
  /** `blocks` x `unitPrice` per billing cycle. */
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
  billingCycle: BillingCycle;
  /** The plan's price per billing cycle. */
  planPrice: number;
  /** The paid blocks' price per billing cycle. */
  addOnsTotal: number;
  addOns: StorageAddOnResponse[];
  offerings: StorageOfferingResponse[];
  companies: StorageCompanyUsageResponse[];
  /** Blocks can be bought only on a paid, running plan. */
  canPurchase: boolean;
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
  billingCycle: BillingCycle;
  /** One block's price for the account's billing cycle. */
  unitPrice: number;
  /** Prorated to the end of the paid period. */
  amountDue: number;
  currency: string;
  pricesIncludeVat: boolean;
  periodStartUtc: string;
  periodEndUtc: string;
  daysRemaining: number;
  /** All paid blocks per billing cycle once this purchase is in. */
  newAddOnsTotal: number;
  /** -1 = unlimited. */
  newLimitMb: number;
}
