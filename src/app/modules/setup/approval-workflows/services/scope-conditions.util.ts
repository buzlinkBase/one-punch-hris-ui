import type {
  ApprovalScopeDimension,
  ApprovalWorkflowScopeDto,
  ScopeCondition,
} from "../models/api/approval-scope.model";

/** Order the dimensions are offered and listed in. */
export const SCOPE_DIMENSIONS: {
  value: ApprovalScopeDimension;
  label: string;
  plural: string;
}[] = [
  { value: "Branch", label: "Branch", plural: "branches" },
  { value: "Department", label: "Department", plural: "departments" },
  { value: "Client", label: "Client", plural: "clients" },
  { value: "Area", label: "Project Site", plural: "project sites" },
  { value: "PayrollGroup", label: "Payroll Group", plural: "payroll groups" },
  { value: "Position", label: "Position", plural: "positions" },
  { value: "Section", label: "Section", plural: "sections" },
  {
    value: "EmploymentStatus",
    label: "Employment Status",
    plural: "employment statuses",
  },
  { value: "Employee", label: "Specific Employees", plural: "employees" },
  { value: "LeaveType", label: "Leave Type", plural: "leave types" },
];

export const dimensionLabel = (dimension: ApprovalScopeDimension): string =>
  SCOPE_DIMENSIONS.find((d) => d.value === dimension)?.label ?? dimension;

/** API conditions -> the form's one-row-per-dimension shape. */
export function fromScopeDtos(
  dtos: ApprovalWorkflowScopeDto[] | undefined,
): ScopeCondition[] {
  return (dtos ?? []).map((d) => ({
    dimension: d.dimension,
    values: d.dimension === "EmploymentStatus" ? d.values : d.targetIds,
  }));
}

/** The form's conditions -> API shape; a row with nothing selected restricts nothing and is dropped. */
export function toScopeDtos(
  conditions: ScopeCondition[],
): ApprovalWorkflowScopeDto[] {
  return conditions
    .filter((c) => c.values.length > 0)
    .map((c) =>
      c.dimension === "EmploymentStatus"
        ? { dimension: c.dimension, targetIds: [], values: c.values }
        : { dimension: c.dimension, targetIds: c.values, values: [] },
    );
}

/**
 * Short readable lines for a workflow's conditions, e.g. "Branch: Makati, Cebu". Long lists are
 * cut to the first few names plus a count. Empty = the company-wide default.
 */
export function describeConditions(
  conditions: ScopeCondition[],
  labelFor: (dimension: ApprovalScopeDimension, value: string) => string,
  maxNames = 3,
): string[] {
  return conditions
    .filter((c) => c.values.length > 0)
    .map((c) => {
      const names = c.values.map((v) => labelFor(c.dimension, v));
      const shown = names.slice(0, maxNames).join(", ");
      const more =
        names.length > maxNames ? ` +${names.length - maxNames} more` : "";
      return `${dimensionLabel(c.dimension)}: ${shown}${more}`;
    });
}
