import type { ApproverType } from "@/shared/types/approval.model";

/** Types whose approver is looked up per applicant (never a fixed person, department or position). */
const DYNAMIC_TYPES: ApproverType[] = [
  "ApplicantManager",
  "ApplicantManagerLevel",
  "ApplicantDepartmentHead",
  "ApplicantSectionHead",
  "ApplicantBranchHead",
  "ApplicantAreaHead",
  "ApplicantClientHead",
];

/** Types that take a "how many levels up" number. */
const LEVEL_TYPES: ApproverType[] = [
  "ApplicantManagerLevel",
  "ApplicantDepartmentHead",
];

export const isDynamicApprover = (type: ApproverType): boolean =>
  DYNAMIC_TYPES.includes(type);

export const takesApproverLevel = (type: ApproverType): boolean =>
  LEVEL_TYPES.includes(type);

/** One person per applicant, so a quorum or narrowing to named people makes no sense. */
export const resolvesToOnePerson = (type: ApproverType): boolean =>
  isDynamicApprover(type) && type !== "ApplicantManager";

/** The sentence under a dynamic type in the editor. */
export function describeDynamicApprover(
  type: ApproverType,
  level?: number,
): string {
  const n = level && level > 0 ? level : 1;
  switch (type) {
    case "ApplicantManager":
      return "Resolved per applicant — their manager";
    case "ApplicantManagerLevel":
      return n <= 1
        ? "Resolved per applicant — their manager"
        : `Resolved per applicant — their manager ${n} levels up the reporting line`;
    case "ApplicantDepartmentHead":
      return n <= 1
        ? "Resolved per applicant — the head of their department"
        : `Resolved per applicant — the head of their department's ${n - 1 === 1 ? "parent" : `${n - 1}-level-up parent`} department`;
    case "ApplicantSectionHead":
      return "Resolved per applicant — the head of their section";
    case "ApplicantBranchHead":
      return "Resolved per applicant — the head of their branch (set on the Branch)";
    case "ApplicantAreaHead":
      return "Resolved per applicant — the head of their project site (set on the Project Site)";
    case "ApplicantClientHead":
      return "Resolved per applicant — the head of their client (set on the Client)";
    default:
      return "Resolved per applicant — their department";
  }
}
