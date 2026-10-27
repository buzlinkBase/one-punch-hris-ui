// Mirrors hrms-api's ApprovalApplicationType/ApproverType/NoteRequirement/ApprovalInstanceStatus/
// ApprovalActionType enums (hrms.Domain/Enums.cs) and ApprovalWorkflowModels.cs response shapes.
export type ApprovalApplicationType =
  | "Leave"
  | "Overtime"
  | "OfficialBusiness"
  | "PassSlip"
  | "Loan"
  | "ProfileUpdate"
  | "PayrollPosting"
  | "Dtr"
  | "DtrDeletion"
  | "PayrollPostingDeletion";

export type ApproverType =
  | "Person"
  | "Department"
  | "Position"
  | "ApplicantManager"
  | "ApplicantDepartment"
  | "ApplicantManagerLevel"
  | "ApplicantDepartmentHead"
  | "ApplicantSectionHead"
  | "ApplicantBranchHead"
  | "ApplicantAreaHead"
  | "ApplicantClientHead";

/** A measure of the request a workflow step can depend on. */
export type ApprovalStepConditionMetric = "None" | "Days" | "Hours" | "Amount";

export type ApprovalConditionOperator =
  "GreaterOrEqual" | "GreaterThan" | "LessOrEqual" | "LessThan";

/** What a step does when its approver can't be worked out for an applicant. */
export type UnresolvedApproverPolicy = "Block" | "Skip" | "FallbackPerson";

export type NoteRequirement = "None" | "Optional" | "Required";

export type ApprovalInstanceStatus =
  "InProgress" | "Approved" | "Declined" | "Cancelled";

export type ApprovalActionType =
  "Approved" | "Declined" | "Reassigned" | "Skipped" | "Escalated";

export interface ApprovalActionResponse {
  stepNumber: number;
  /** Null for a system entry such as a skipped step. */
  actorEmployeeId?: string | null;
  /** Resolved server-side, so the Employee Portal (which can't load the employee list) still
   * shows "Approved by Jane Doe" instead of a raw id. */
  actorName?: string | null;
  /** Set when the actor decided for someone who had delegated their approvals to them. */
  onBehalfOfName?: string | null;
  action: ApprovalActionType;
  note?: string | null;
  createdAt: string;
}

export interface ApprovalStepSummary {
  stepNumber: number;
  approverType: ApproverType;
  /** Resolved server-side — a name, department, position, or "Your Manager"/"Your Department". */
  approverLabel?: string | null;
  noteRequirement: NoteRequirement;
}

/** Where one pool of a step with several stands: approvals so far against what it needs. */
export interface ApprovalPoolProgress {
  label?: string | null;
  approved: number;
  required: number;
  satisfied: boolean;
}

export interface ApprovalInstanceResponse {
  applicationType: ApprovalApplicationType;
  applicationId: string;
  approvalWorkflowId?: string | null;
  /** The workflow this request is running on; null for the single-step fallback. */
  approvalWorkflowName?: string | null;
  currentStepNumber: number;
  totalSteps: number;
  status: ApprovalInstanceStatus;
  currentStepNoteRequirement: NoteRequirement;
  /** Null once no longer InProgress, or for the implicit fallback step (no workflow configured). */
  currentStepApproverType?: ApproverType | null;
  /** The current step looks the approver up per applicant and found nobody -- an admin must reassign it. */
  currentStepNoApprover?: boolean;
  /** Only for a current step with several pools: each pool's progress. */
  currentStepPools?: ApprovalPoolProgress[];
  /** Resolved server-side — a name, department, position, or "Your Manager"/"Your Department". */
  currentStepApproverLabel?: string | null;
  actions: ApprovalActionResponse[];
  /** Every step of the workflow, in order — lets the timeline show upcoming steps' approvers. */
  steps: ApprovalStepSummary[];
}
