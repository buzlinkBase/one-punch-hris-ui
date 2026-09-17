// Mirrors hrms-api's ApprovalApplicationType/ApproverType/NoteRequirement/ApprovalInstanceStatus/
// ApprovalActionType enums (hrms.Domain/Enums.cs) and ApprovalWorkflowModels.cs response shapes.
export type ApprovalApplicationType =
  "Leave" | "Overtime" | "OfficialBusiness" | "PassSlip" | "Loan";

export type ApproverType =
  | "Person"
  | "Department"
  | "Position"
  | "ApplicantManager"
  | "ApplicantDepartment";

export type NoteRequirement = "None" | "Optional" | "Required";

export type ApprovalInstanceStatus =
  "InProgress" | "Approved" | "Declined" | "Cancelled";

export type ApprovalActionType = "Approved" | "Declined";

export interface ApprovalActionResponse {
  stepNumber: number;
  actorEmployeeId: string;
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

export interface ApprovalInstanceResponse {
  applicationType: ApprovalApplicationType;
  applicationId: string;
  approvalWorkflowId?: string | null;
  currentStepNumber: number;
  totalSteps: number;
  status: ApprovalInstanceStatus;
  currentStepNoteRequirement: NoteRequirement;
  /** Null once no longer InProgress, or for the implicit fallback step (no workflow configured). */
  currentStepApproverType?: ApproverType | null;
  /** Resolved server-side — a name, department, position, or "Your Manager"/"Your Department". */
  currentStepApproverLabel?: string | null;
  actions: ApprovalActionResponse[];
  /** Every step of the workflow, in order — lets the timeline show upcoming steps' approvers. */
  steps: ApprovalStepSummary[];
}
