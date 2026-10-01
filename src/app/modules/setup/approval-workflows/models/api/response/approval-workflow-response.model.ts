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
  /** Same as canEdit (kept for older screens). */
  isEditable: boolean;
  /** Requests still going through this workflow -- it can't change until they finish. */
  inProgressCount: number;
  hasBeenUsed: boolean;
  canEdit: boolean;
  /** Only a never-used workflow can be deleted. */
  canDelete: boolean;
  /** Set when this version is scheduled to take over from that active workflow once it drains. */
  replacesWorkflowId?: string | null;
  replacesWorkflowName?: string | null;
  /** Set on the active workflow when another version is waiting to take over from it. */
  replacedByWorkflowName?: string | null;
  steps: ApprovalWorkflowStepResponse[];
  /**
   * Names of the employees the steps reference, keyed by id -- "Confidential" for one the
   * caller may not see (they're missing from the employee dropdown list).
   */
  approverNames?: Record<string, string>;
}
