import type {
  ApprovalApplicationType,
  ApproverType,
  ApprovalConditionOperator,
  ApprovalStepConditionMetric,
  NoteRequirement,
  UnresolvedApproverPolicy,
} from "@/shared/types/approval.model";

export const APPROVAL_WORKFLOWS_LABEL = {
  TITLE: "Approval Workflows",
  SUBTITLE:
    "Configure how many approval levels each application type must pass through, and who approves at each step. Run several workflows at once by limiting each to certain branches, sites, departments and so on. Applications no workflow covers keep today's single-step behavior.",
  CREATE_TITLE: "New Approval Workflow",
  EDIT_TITLE: "Edit Approval Workflow",
  VIEW_TITLE: "View Approval Workflow",
};

export const APPLICATION_TYPE_OPTIONS: {
  value: ApprovalApplicationType;
  label: string;
}[] = [
  { value: "Leave", label: "Leave" },
  { value: "Overtime", label: "Overtime" },
  { value: "OfficialBusiness", label: "Official Business" },
  { value: "PassSlip", label: "Pass Slip" },
  { value: "Loan", label: "Loan/Deduction" },
  { value: "ProfileUpdate", label: "Profile Update" },
  { value: "PayrollPosting", label: "Payroll Posting" },
  { value: "Dtr", label: "DTR Posting" },
  { value: "DtrDeletion", label: "DTR Deletion" },
  { value: "PayrollPostingDeletion", label: "Payroll Posting Deletion" },
];

export const APPLICATION_TYPE_LABEL: Record<ApprovalApplicationType, string> = {
  Leave: "Leave",
  Overtime: "Overtime",
  OfficialBusiness: "Official Business",
  PassSlip: "Pass Slip",
  Loan: "Loan/Deduction",
  ProfileUpdate: "Profile Update",
  PayrollPosting: "Payroll Posting",
  Dtr: "DTR Posting",
  DtrDeletion: "DTR Deletion",
  PayrollPostingDeletion: "Payroll Posting Deletion",
};

export const APPROVER_TYPE_OPTIONS: { value: ApproverType; label: string }[] = [
  { value: "Person", label: "Specific Person" },
  { value: "Department", label: "Department" },
  { value: "Position", label: "Position" },
  { value: "ApplicantManager", label: "Applicant's Manager" },
  { value: "ApplicantDepartment", label: "Applicant's Department" },
  {
    value: "ApplicantManagerLevel",
    label: "Applicant's Manager (N levels up)",
  },
  { value: "ApplicantDepartmentHead", label: "Applicant's Department Head" },
  { value: "ApplicantSectionHead", label: "Applicant's Section Head" },
  { value: "ApplicantBranchHead", label: "Applicant's Branch Head" },
  { value: "ApplicantAreaHead", label: "Applicant's Project Site Head" },
  { value: "ApplicantClientHead", label: "Applicant's Client Head" },
];

/** The measures each request type has -- what a step on it can depend on. */
const CONDITION_METRICS_BY_TYPE: Partial<
  Record<ApprovalApplicationType, ApprovalStepConditionMetric[]>
> = {
  Leave: ["Days"],
  OfficialBusiness: ["Days", "Amount"],
  Overtime: ["Hours"],
  PassSlip: ["Hours"],
  Loan: ["Amount"],
};

export const CONDITION_METRIC_LABEL: Record<
  Exclude<ApprovalStepConditionMetric, "None">,
  string
> = {
  Days: "Days",
  Hours: "Hours",
  Amount: "Amount (₱)",
};

export const conditionMetricOptions = (
  type: ApprovalApplicationType,
): { value: ApprovalStepConditionMetric; label: string }[] => [
  { value: "None", label: "Always (no condition)" },
  ...(CONDITION_METRICS_BY_TYPE[type] ?? []).map((m) => ({
    value: m,
    label: `Only when ${CONDITION_METRIC_LABEL[m as Exclude<ApprovalStepConditionMetric, "None">]}…`,
  })),
];

export const hasConditionMetrics = (type: ApprovalApplicationType): boolean =>
  (CONDITION_METRICS_BY_TYPE[type]?.length ?? 0) > 0;

export const CONDITION_OPERATOR_OPTIONS: {
  value: ApprovalConditionOperator;
  label: string;
}[] = [
  { value: "GreaterOrEqual", label: "is at least (≥)" },
  { value: "GreaterThan", label: "is more than (>)" },
  { value: "LessOrEqual", label: "is at most (≤)" },
  { value: "LessThan", label: "is less than (<)" },
];

export const UNRESOLVED_POLICY_OPTIONS: {
  value: UnresolvedApproverPolicy;
  label: string;
}[] = [
  { value: "Block", label: "Wait for an admin to reassign" },
  { value: "Skip", label: "Skip this step" },
  { value: "FallbackPerson", label: "Use a fallback person" },
];

export const NOTE_REQUIREMENT_OPTIONS: {
  value: NoteRequirement;
  label: string;
}[] = [
  { value: "None", label: "No note" },
  { value: "Optional", label: "Optional note" },
  { value: "Required", label: "Required note" },
];
