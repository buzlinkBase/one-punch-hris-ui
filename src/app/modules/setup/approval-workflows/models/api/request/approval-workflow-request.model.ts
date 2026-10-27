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

export interface ApprovalWorkflowStepRequest {
  stepNumber: number;
  approverType: ApproverType;
  approverEmployeeId?: string | null;
  approverDepartmentId?: string | null;
  approverPositionId?: string | null;
  minApprovals: number;
  /** Manager level / department head: how many levels up (1 = the nearest). */
  approverLevel?: number | null;
  /** What to do when a per-applicant approver can't be found. */
  onUnresolved: UnresolvedApproverPolicy;
  fallbackEmployeeId?: string | null;
  /** The step applies only when this measure of the request passes the threshold; None = always. */
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

export interface ApprovalWorkflowRequest {
  applicationType: ApprovalApplicationType;
  name: string;
  /** Legacy single department; the editor now sends scopes instead and leaves this null. */
  scopeDepartmentId?: string | null;
  /** Who it applies to; empty = the company-wide default. */
  scopes: ApprovalWorkflowScopeDto[];
  /** Lower is checked first when an applicant matches several active workflows. */
  priority: number;
  steps: ApprovalWorkflowStepRequest[];
}
