import type {
  AnnouncementPriority,
  AudienceRuleKind,
} from "@/shared/types/announcement.model";

/** Mirrors hrms-api AudienceRuleRequest. */
export interface AudienceRuleRequest {
  kind: AudienceRuleKind;
  targetId: string | null;
  targetValue: string | null;
  targetLabel: string;
  isExclusion: boolean;
}

/** Mirrors hrms-api AnnouncementUpsertRequest (create a draft, or edit). */
export interface AnnouncementUpsertRequest {
  title: string;
  body: string;
  priority: AnnouncementPriority;
  requiresAcknowledgement: boolean;
  acknowledgeByUtc: string | null;
  expiresAtUtc: string | null;
  isPinned: boolean;
  pinnedUntilUtc: string | null;
  excludeInactive: boolean;
  /** Ignored by the API once published -- recipients were already snapshotted. */
  audienceRules: AudienceRuleRequest[];
  /** Edit after publishing only: everyone must acknowledge the new version. */
  requireReacknowledgement: boolean;
}

export interface AudiencePreviewRequest {
  audienceRules: AudienceRuleRequest[];
  excludeInactive: boolean;
}

export type AnnouncementListTab =
  "Active" | "Unpublished" | "Archived" | "Deleted";

export interface AnnouncementListQuery {
  tab: AnnouncementListTab;
  search?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

export type RecipientStatusFilter =
  | "All"
  | "Viewed"
  | "NotViewed"
  | "Acknowledged"
  | "NotAcknowledged"
  | "Overdue"
  | "Unreachable";

export interface RecipientListQuery {
  status: RecipientStatusFilter;
  search?: string;
  department?: string;
  position?: string;
  branch?: string;
  sortField?: "name" | "department" | "firstViewedAt" | "acknowledgedAt";
  sortOrder?: "ascend" | "descend";
  page: number;
  /** 0 = everything (Excel export). */
  limit: number;
}

export type RemindTarget = "NotViewed" | "NotAcknowledged";
