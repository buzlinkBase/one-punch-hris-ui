import type {
  ApprovalActionType,
  ApprovalApplicationType,
  ApprovalInstanceStatus,
  NoteRequirement,
} from "@/shared/types/approval.model";

/** A finished request the signed-in person decided, as themself or through a delegate. */
export interface MyApprovalHistory {
  applicationType: ApprovalApplicationType;
  applicationId: string;
  applicantEmployeeId: string;
  applicantName: string;
  summary: string;
  filedAt: string;
  /** Where the request ended up: Approved, Declined or Cancelled. */
  finalStatus: ApprovalInstanceStatus;
  /** What the signed-in person (or their delegate) decided. */
  myDecision: ApprovalActionType;
  decidedAt: string;
  note?: string | null;
  /** Set when the signed-in person decided for someone who delegated to them. */
  onBehalfOfName?: string | null;
  /** Set when the signed-in person's delegate decided in their place. */
  decidedByName?: string | null;
  /** Who approved or declined each step, in step order. */
  trail: MyApprovalTrailEntry[];
}

export interface MyApprovalTrailEntry {
  stepNumber: number;
  action: ApprovalActionType;
  /** Null for a step the system skipped. */
  approverName?: string | null;
  /** Set when the approver acted for someone who delegated to them. */
  onBehalfOfName?: string | null;
  at: string;
  note?: string | null;
}

/**
 * One request on the signed-in person's approval lists: waiting on them (directly, or because
 * someone delegated to them), or still in progress on someone else's step.
 */
export interface MyApproval {
  applicationType: ApprovalApplicationType;
  applicationId: string;
  applicantEmployeeId: string;
  applicantName: string;
  /** e.g. "Vacation Leave · Oct 5 – Oct 7". */
  summary: string;
  filedAt: string;
  stepNumber: number;
  totalSteps: number;
  /** The workflow the request runs on; null for the single-step fallback. */
  flowName?: string | null;
  noteRequirement: NoteRequirement;
  /** Set when the signed-in person is acting for someone who delegated to them. */
  onBehalfOfEmployeeId?: string | null;
  onBehalfOfName?: string | null;
  /** Who the current step is waiting on, e.g. "Ben Cruz", "HR Department", "HR + Finance". */
  currentApproverLabel?: string | null;
}
