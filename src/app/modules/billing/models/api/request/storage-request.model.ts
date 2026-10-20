import type { BillingCycle } from "../response/subscription-response.model";

export interface StoragePurchaseRequest {
  offeringCode: string;
  blocks: number;
  /** The storage cycle when this purchase starts the storage period; ignored while one runs. */
  billingCycle?: BillingCycle;
}

export interface StorageReductionRequest {
  addOnId: string;
  /** Blocks to hold after the paid storage period ends; 0 cancels them. */
  blocks: number;
}

/** Switch storage to monthly or annual billing from its next renewal. */
export interface StorageCycleRequest {
  billingCycle: BillingCycle;
}
