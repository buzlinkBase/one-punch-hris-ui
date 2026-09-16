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

export interface ApprovalInstanceResponse {
  applicationType: ApprovalApplicationType;
  applicationId: string;
  approvalWorkflowId?: string | null;
  currentStepNumber: number;
  totalSteps: number;
  status: ApprovalInstanceStatus;
  currentStepNoteRequirement: NoteRequirement;
  actions: ApprovalActionResponse[];
}
