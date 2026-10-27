import type {
  ApprovalApplicationType,
  NoteRequirement,
} from "@/shared/types/approval.model";

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
