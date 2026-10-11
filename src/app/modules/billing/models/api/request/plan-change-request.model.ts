import type { BillingCycle } from "../response/subscription-response.model";

export interface PlanChangeRequest {
  planCode: string;
  billingCycle: BillingCycle;
}
