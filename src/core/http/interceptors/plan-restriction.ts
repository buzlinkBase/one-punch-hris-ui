import {
  SUBSCRIPTION_PROBLEM_TYPES,
  type SubscriptionProblemType,
} from "@/shared/constants/entitlement-keys.const";
import type { PlanRestriction } from "@/core/stores/plan-restriction.store";

const TYPES = new Set<string>(Object.values(SUBSCRIPTION_PROBLEM_TYPES));

/**
 * Reads a subscription refusal out of an error response's ProblemDetails (`data` of the
 * ResponseModel envelope every service returns). Null for any other error. The extensions
 * (feature, limit, max, used) arrive as top-level ProblemDetails fields.
 */
export function toPlanRestriction(body: unknown): PlanRestriction | null {
  if (!body || typeof body !== "object") return null;
  const problem = (body as { data?: unknown }).data;
  if (!problem || typeof problem !== "object") return null;

  const fields = problem as Record<string, unknown>;
  if (typeof fields.type !== "string" || !TYPES.has(fields.type)) return null;

  return {
    type: fields.type as SubscriptionProblemType,
    detail: typeof fields.detail === "string" ? fields.detail : "",
    feature: typeof fields.feature === "string" ? fields.feature : undefined,
    limit: typeof fields.limit === "string" ? fields.limit : undefined,
    max: typeof fields.max === "number" ? fields.max : null,
    used: typeof fields.used === "number" ? fields.used : undefined,
  };
}
