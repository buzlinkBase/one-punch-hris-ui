import type {
  ApprovalApplicationType,
  ApproverType,
  NoteRequirement,
} from "@/shared/types/approval.model";

export const APPROVAL_WORKFLOWS_LABEL = {
  TITLE: "Approval Workflows",
  SUBTITLE:
    "Configure how many approval levels each application type must pass through, and who approves at each step. Types left unconfigured keep today's single-step behavior.",
  CREATE_TITLE: "New Approval Workflow",
  EDIT_TITLE: "Edit Approval Workflow",
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
];

export const NOTE_REQUIREMENT_OPTIONS: {
  value: NoteRequirement;
  label: string;
}[] = [
  { value: "None", label: "No note" },
  { value: "Optional", label: "Optional note" },
  { value: "Required", label: "Required note" },
];
