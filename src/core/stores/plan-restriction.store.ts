import { create } from "zustand";
import type { SubscriptionProblemType } from "@/shared/constants/entitlement-keys.const";

/** A request the subscription refused (403 with a subscription ProblemDetails type). */
export interface PlanRestriction {
  type: SubscriptionProblemType;
  detail: string;
  /** plan-required: the feature the plan lacks. */
  feature?: string;
  /** plan-limit-reached: the limit, its maximum (null = unlimited) and current use. */
  limit?: string;
  max?: number | null;
  used?: number;
}

interface PlanRestrictionStore {
  restriction: PlanRestriction | null;
  show: (restriction: PlanRestriction) => void;
  clear: () => void;
}

// Set by the axios error interceptor; PlanRestrictionModal (mounted in each layout) shows it.
export const usePlanRestrictionStore = create<PlanRestrictionStore>((set) => ({
  restriction: null,
  show: (restriction) => set({ restriction }),
  clear: () => set({ restriction: null }),
}));
