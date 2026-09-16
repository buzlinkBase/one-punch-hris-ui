import type {
  ApprovalApplicationType,
  ApproverType,
  NoteRequirement,
} from "@/shared/types/approval.model";

export interface ApprovalWorkflowStepResponse {
  id: string;
  stepNumber: number;
  approverType: ApproverType;
  approverEmployeeId?: string | null;
  approverDepartmentId?: string | null;
  approverPositionId?: string | null;
  minApprovals: number;
  noteRequirement: NoteRequirement;
  namedApproverEmployeeIds: string[];
}

export interface ApprovalWorkflowResponse {
  id: string;
  applicationType: ApprovalApplicationType;
  name: string;
  isActive: boolean;
  scopeDepartmentId?: string | null;
  scopeDepartmentName?: string | null;
  isEditable: boolean;
  steps: ApprovalWorkflowStepResponse[];
}
