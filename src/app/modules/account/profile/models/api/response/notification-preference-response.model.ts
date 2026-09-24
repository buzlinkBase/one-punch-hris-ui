import type { ApprovalApplicationType } from "@/shared/types/approval.model";

// Only categories the employee has an explicit row for come back here -- a category with no
// row is implicitly both-channels-on (see NotificationPreference's opt-out model on the
// backend), which the UI renders itself rather than the API materializing a full row per
// category.
export interface NotificationPreferenceResponse {
  applicationType: ApprovalApplicationType;
  emailEnabled: boolean;
  pushEnabled: boolean;
}
