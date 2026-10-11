import { describe, expect, it } from "vitest";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";
import { PENDING_YOUR_APPROVAL, approvalLink } from "./approval-link";

const link = (applicationType: ApprovalApplicationType, statusLabel: string) =>
  approvalLink({ applicationType, applicationId: "a-1", statusLabel });

describe("approvalLink", () => {
  it.each<[ApprovalApplicationType, string, string]>([
    ["Leave", "/applications/leave/a-1", "/portal/leave-applications/a-1/view"],
    ["Overtime", "/applications/overtime/a-1", "/portal/overtime/a-1/view"],
    [
      "OfficialBusiness",
      "/applications/official-business/a-1",
      "/portal/official-business/a-1/view",
    ],
    ["PassSlip", "/applications/pass-slip/a-1", "/portal/pass-slip/a-1/view"],
    [
      "Loan",
      "/applications/deduction-application/a-1",
      "/portal/loan-applications/a-1/view",
    ],
  ])(
    "%s opens the approver's page when waiting on them, else the applicant's",
    (type, approver, applicant) => {
      expect(link(type, PENDING_YOUR_APPROVAL)).toBe(approver);
      expect(link(type, "Approved")).toBe(applicant);
      expect(link(type, "Step Approved")).toBe(applicant);
    },
  );

  it("sends a profile update's applicant to their profile", () => {
    expect(link("ProfileUpdate", PENDING_YOUR_APPROVAL)).toBe(
      "/applications/profile-update-request/a-1",
    );
    expect(link("ProfileUpdate", "Declined")).toBe("/portal/profile");
  });

  it.each<[ApprovalApplicationType, string]>([
    ["Dtr", "/daily-time-record/master"],
    ["DtrDeletion", "/daily-time-record/master"],
    ["PayrollPosting", "/daily-time-record/for-payroll"],
    ["PayrollPostingDeletion", "/daily-time-record/for-payroll"],
  ])("opens %s batches on their batch screen either way", (type, path) => {
    expect(link(type, PENDING_YOUR_APPROVAL)).toBe(path);
    expect(link(type, "Approved")).toBe(path);
  });
});
