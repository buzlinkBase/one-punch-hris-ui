/** Mirrors hrms-api's ApprovalScopeDimension enum (hrms.Domain/Enums.cs). */
export type ApprovalScopeDimension =
  | "Branch"
  | "Department"
  | "Client"
  | "Area"
  | "PayrollGroup"
  | "Position"
  | "Section"
  | "EmploymentStatus"
  | "Employee"
  | "LeaveType";

/**
 * One scope condition as the API sends/receives it. Entity dimensions use targetIds;
 * EmploymentStatus uses values (the status names).
 */
export interface ApprovalWorkflowScopeDto {
  dimension: ApprovalScopeDimension;
  targetIds: string[];
  values: string[];
}

/** A scope condition as the form edits it: one dimension and its chosen ids (or status names). */
export interface ScopeCondition {
  dimension: ApprovalScopeDimension;
  values: string[];
}

export interface ApprovalWorkflowCandidate {
  id: string;
  name: string;
  priority: number;
  /** Whether the employee falls under this workflow's conditions. */
  matched: boolean;
}

/** Which active workflow an employee's applications of a type run on (none = single-step fallback). */
export interface ApprovalWorkflowResolution {
  workflowId?: string | null;
  workflowName?: string | null;
  isFallback: boolean;
  /** Every active workflow of the type, in the order they are tried. */
  candidates: ApprovalWorkflowCandidate[];
}
