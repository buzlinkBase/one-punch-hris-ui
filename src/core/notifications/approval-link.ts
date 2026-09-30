import type { ApprovalApplicationType } from "@/shared/types/approval.model";

/** The status an approver's "it's waiting on you" notice carries (ApprovalEngineService). */
export const PENDING_YOUR_APPROVAL = "Pending Your Approval";

export interface ApprovalLinkTarget {
  applicationType: ApprovalApplicationType;
  applicationId: string;
  statusLabel: string;
}

interface ApprovalRoutes {
  /** Where the approver acts on it: the admin detail page with the approval timeline. */
  approver: (id: string) => string;
  /** The applicant's own view of it. */
  applicant: (id: string) => string;
}

const sameFor = (path: string): ApprovalRoutes => ({
  approver: () => path,
  applicant: () => path,
});

// DTR and payroll batches have no per-id page -- their approval lives on the batch tab of these
// screens, and their "applicant" is the HR preparer, so both sides go there.
const ROUTES: Record<ApprovalApplicationType, ApprovalRoutes> = {
  Leave: {
    approver: (id) => `/applications/leave/${id}`,
    applicant: (id) => `/portal/leave-applications/${id}/view`,
  },
  Overtime: {
    approver: (id) => `/applications/overtime/${id}`,
    applicant: (id) => `/portal/overtime/${id}/view`,
  },
  OfficialBusiness: {
    approver: (id) => `/applications/official-business/${id}`,
    applicant: (id) => `/portal/official-business/${id}/view`,
  },
  PassSlip: {
    approver: (id) => `/applications/pass-slip/${id}`,
    applicant: (id) => `/portal/pass-slip/${id}/view`,
  },
  Loan: {
    approver: (id) => `/applications/deduction-application/${id}`,
    applicant: (id) => `/portal/loan-applications/${id}/view`,
  },
  ProfileUpdate: {
    approver: (id) => `/applications/profile-update-request/${id}`,
    applicant: () => "/portal/profile",
  },
  Dtr: sameFor("/daily-time-record/master"),
  DtrDeletion: sameFor("/daily-time-record/master"),
  PayrollPosting: sameFor("/daily-time-record/for-payroll"),
  PayrollPostingDeletion: sameFor("/daily-time-record/for-payroll"),
};

/**
 * The screen an approval notice opens: the approver's for "waiting on you", otherwise the
 * applicant's own (approved, declined, moved to the next step).
 */
export function approvalLink(target: ApprovalLinkTarget): string | undefined {
  const routes = ROUTES[target.applicationType];
  if (!routes) return undefined;
  return target.statusLabel === PENDING_YOUR_APPROVAL
    ? routes.approver(target.applicationId)
    : routes.applicant(target.applicationId);
}
