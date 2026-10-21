import type { PostRequirementResponse } from "../models/api/response/deployment-response.model";

/** "DS 2 · Mon, Tue" for a requirement; "daily" when no days are set. */
export function requirementLabel(r: PostRequirementResponse): string {
  const days = r.daysOfWeek.length === 0 ? "daily" : r.daysOfWeek.join(", ");
  return `${r.shiftLabel} ${r.requiredHeadcount} · ${days}`;
}
