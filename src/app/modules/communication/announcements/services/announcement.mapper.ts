import type {
  AnnouncementFormValues,
  AudienceRuleFormValues,
} from "../models/forms/announcement-form.schema";
import type {
  AnnouncementUpsertRequest,
  AudiencePreviewRequest,
  AudienceRuleRequest,
} from "../models/api/request/announcement-request.model";
import type { AnnouncementDetail } from "../models/api/response/announcement-response.model";

function toRuleRequest(rule: AudienceRuleFormValues): AudienceRuleRequest {
  const needsTarget =
    rule.kind !== "AllEmployees" && rule.kind !== "EmploymentStatus";
  return {
    kind: rule.kind,
    targetId: needsTarget ? rule.targetId : null,
    targetValue: rule.kind === "EmploymentStatus" ? rule.targetValue : null,
    targetLabel:
      rule.kind === "AllEmployees" ? "All employees" : rule.targetLabel,
    isExclusion: rule.isExclusion,
  };
}

/** Rules that can't mean anything yet (no target picked) are left out of a live preview. */
export function isCompleteRule(rule: AudienceRuleFormValues): boolean {
  if (rule.kind === "AllEmployees") return true;
  if (rule.kind === "EmploymentStatus") return !!rule.targetValue;
  return !!rule.targetId;
}

export function toUpsertRequest(
  values: AnnouncementFormValues,
): AnnouncementUpsertRequest {
  return {
    title: values.title.trim(),
    body: values.body.trim(),
    priority: values.priority,
    requiresAcknowledgement: values.requiresAcknowledgement,
    acknowledgeByUtc: values.requiresAcknowledgement
      ? values.acknowledgeByUtc
      : null,
    expiresAtUtc: values.expiresAtUtc,
    isPinned: values.isPinned,
    pinnedUntilUtc: values.isPinned ? values.pinnedUntilUtc : null,
    excludeInactive: values.excludeInactive,
    audienceRules: values.audienceRules.map(toRuleRequest),
    requireReacknowledgement:
      values.requiresAcknowledgement && values.requireReacknowledgement,
  };
}

export function toPreviewRequest(
  rules: AudienceRuleFormValues[],
  excludeInactive: boolean,
): AudiencePreviewRequest {
  return {
    audienceRules: rules.filter(isCompleteRule).map(toRuleRequest),
    excludeInactive,
  };
}

export function toFormValues(
  detail: AnnouncementDetail,
): AnnouncementFormValues {
  return {
    title: detail.title,
    body: detail.body,
    priority: detail.priority,
    requiresAcknowledgement: detail.requiresAcknowledgement,
    acknowledgeByUtc: detail.acknowledgeByUtc,
    isPinned: detail.isPinned,
    pinnedUntilUtc: detail.pinnedUntilUtc,
    expiresAtUtc: detail.expiresAtUtc,
    excludeInactive: detail.excludeInactive,
    audienceRules: detail.audienceRules.map((r) => ({
      kind: r.kind,
      targetId: r.targetId,
      targetValue: r.targetValue,
      targetLabel: r.targetLabel,
      isExclusion: r.isExclusion,
    })),
    requireReacknowledgement: false,
  };
}
