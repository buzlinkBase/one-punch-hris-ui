export interface StoragePurchaseRequest {
  offeringCode: string;
  blocks: number;
}

export interface StorageReductionRequest {
  addOnId: string;
  /** Blocks to hold after the paid period ends; 0 cancels them. */
  blocks: number;
}
