import type {
  ApprovalApplicationType,
  ApproverType,
  NoteRequirement,
} from "@/shared/types/approval.model";

export interface ApprovalWorkflowStepRequest {
  stepNumber: number;
  approverType: ApproverType;
  approverEmployeeId?: string | null;
  approverDepartmentId?: string | null;
  approverPositionId?: string | null;
  minApprovals: number;
  noteRequirement: NoteRequirement;
  namedApproverEmployeeIds: string[];
}

export interface ApprovalWorkflowRequest {
  applicationType: ApprovalApplicationType;
  name: string;
  scopeDepartmentId?: string | null;
  steps: ApprovalWorkflowStepRequest[];
}
