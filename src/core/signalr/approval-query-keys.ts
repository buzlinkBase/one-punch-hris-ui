import type { QueryKey } from "@tanstack/react-query";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";

/**
 * Every list query an approval push can make stale, per application type — both the Employee
 * Portal's own "My …" lists (`["me", …]`) and the admin-side Applications/DTR/Payroll lists.
 * useApprovalHub invalidates these on each push, so whichever screen is open refreshes live
 * instead of showing the old status until a reload. Prefix keys: invalidation matches every
 * query that starts with them (any filters/params).
 */
export const APPROVAL_LIST_QUERY_KEYS: Record<
  ApprovalApplicationType,
  QueryKey[]
> = {
  Leave: [
    ["me", "leave-applications"],
    ["me", "leave-credits"],
    ["leave-applications"],
  ],
  Overtime: [["me", "overtime-applications"], ["overtime-applications"]],
  OfficialBusiness: [
    ["me", "travel-order-applications"],
    ["travel-order-applications"],
  ],
  PassSlip: [["me", "pass-slip-applications"], ["pass-slips"]],
  Loan: [["me", "loan-applications"], ["deduction-applications"]],
  ProfileUpdate: [
    ["me", "profile-update-requests"],
    ["profile-update-requests"],
  ],
  Dtr: [["daily-time-record"], ["dtr-batches"]],
  DtrDeletion: [["daily-time-record"], ["dtr-batches"]],
  PayrollPosting: [["payroll-batches"]],
  PayrollPostingDeletion: [["payroll-batches"]],
};
