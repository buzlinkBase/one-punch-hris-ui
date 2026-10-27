import type {
  ApprovalApplicationType,
  ApproverType,
  ApprovalConditionOperator,
  ApprovalStepConditionMetric,
  NoteRequirement,
  UnresolvedApproverPolicy,
} from "@/shared/types/approval.model";
import type { ApprovalWorkflowScopeDto } from "../approval-scope.model";

/** One extra pool of approvers on a step; the step needs every pool to reach its quorum. */
export interface ApprovalWorkflowStepGroup {
  approverType: ApproverType;
  approverEmployeeId?: string | null;
  approverDepartmentId?: string | null;
  approverPositionId?: string | null;
  approverLevel?: number | null;
  onUnresolved: UnresolvedApproverPolicy;
  fallbackEmployeeId?: string | null;
  minApprovals: number;
}

export interface ApprovalWorkflowStepResponse {
  id: string;
  stepNumber: number;
  approverType: ApproverType;
  approverEmployeeId?: string | null;
  approverDepartmentId?: string | null;
  approverPositionId?: string | null;
  minApprovals: number;
  approverLevel?: number | null;
  onUnresolved: UnresolvedApproverPolicy;
  fallbackEmployeeId?: string | null;
  conditionMetric: ApprovalStepConditionMetric;
  conditionOperator: ApprovalConditionOperator;
  conditionValue?: number | null;
  /** Hours after the request reached this step to first remind its approvers; null = no reminder. */
  remindAfterHours?: number | null;
  /** And again every this many hours (needs a first reminder). */
  remindRepeatHours?: number | null;
  /** Hours after which the step is also opened to the escalation person. */
  escalateAfterHours?: number | null;
  escalateToEmployeeId?: string | null;
  noteRequirement: NoteRequirement;
  namedApproverEmployeeIds: string[];
  /** Extra pools of approvers; empty = an ordinary single-pool step. */
  groups: ApprovalWorkflowStepGroup[];
}

export interface ApprovalWorkflowResponse {
  id: string;
  applicationType: ApprovalApplicationType;
  name: string;
  isActive: boolean;
  scopeDepartmentId?: string | null;
  scopeDepartmentName?: string | null;
  priority: number;
  /** Who it applies to (the legacy single department folded in); empty = everyone. */
  scopes: ApprovalWorkflowScopeDto[];
  /** Workflows with the same slot (type + identical conditions) are versions of each other. */
  slotKey: string;
  /** Other active workflows that can apply to the same people at the same priority. */
  overlapsWith: string[];
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
