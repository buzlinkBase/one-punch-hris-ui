import type {
  AnnouncementPriority,
  AnnouncementState,
  AudienceRuleKind,
} from "@/shared/types/announcement.model";

/** What hrms-api's AnnouncementStateMachine allows right now -- drives the action menu. */
export type AnnouncementAction =
  | "Edit"
  | "Schedule"
  | "Unschedule"
  | "PublishNow"
  | "Unpublish"
  | "Republish"
  | "Remind"
  | "Pin"
  | "Unpin"
  | "Archive"
  | "Restore"
  | "Duplicate"
  | "Delete"
  | "RestoreDeleted";

export interface AnnouncementSummary {
  id: string;
  title: string;
  priority: AnnouncementPriority;
  state: AnnouncementState;
  isExpired: boolean;
  isPinned: boolean;
  requiresAcknowledgement: boolean;
  acknowledgeByUtc: string | null;
  publishAtUtc: string | null;
  publishedAtUtc: string | null;
  publishedByName: string | null;
  createdByName: string;
  createdAt: string;
  expiresAtUtc: string | null;
  unpublishedAtUtc: string | null;
  archivedAtUtc: string | null;
  /** When a binned announcement is purged for good. */
  purgeAtUtc: string | null;
  version: number;
  audienceSummary: string[];
  recipientCount: number;
  viewedCount: number;
  acknowledgedCount: number;
  allowedActions: AnnouncementAction[];
}

export interface AudienceRuleResponse {
  id: string;
  kind: AudienceRuleKind;
  targetId: string | null;
  targetValue: string | null;
  targetLabel: string;
  isExclusion: boolean;
}

export interface AnnouncementDetail extends AnnouncementSummary {
  body: string;
  pinnedUntilUtc: string | null;
  excludeInactive: boolean;
  lastEditedAtUtc: string | null;
  unpublishedByName: string | null;
  unpublishReason: string | null;
  audienceRules: AudienceRuleResponse[];
}

export interface NameCount {
  name: string;
  count: number;
}

export interface AudiencePreview {
  total: number;
  sample: string[];
  byDepartment: NameCount[];
}

export interface BreakdownRow {
  name: string;
  total: number;
  viewed: number;
  acknowledged: number;
}

export interface AnnouncementStats {
  reach: number;
  viewed: number;
  notViewed: number;
  viewRate: number;
  requiresAcknowledgement: boolean;
  acknowledged: number;
  pendingAcknowledgement: number;
  acknowledgementRate: number;
  overdue: number;
  /** No login account -- can't open it until one is linked. */
  unreachable: number;
  byDepartment: BreakdownRow[];
  byPosition: BreakdownRow[];
  byBranch: BreakdownRow[];
  viewsPerDay: { date: string; count: number }[];
}

export interface AnnouncementRecipient {
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  departmentName: string;
  positionName: string;
  branchName: string;
  isReachable: boolean;
  deliveredAt: string;
  firstViewedAt: string | null;
  lastViewedAt: string | null;
  viewCount: number;
  acknowledgedAt: string | null;
  acknowledgedVersion: number | null;
  isAcknowledged: boolean;
  isOverdue: boolean;
  remindCount: number;
  lastRemindedAt: string | null;
}
