import { describe, expect, it } from "vitest";
import type { UserNotification } from "./models/user-notification.model";
import { approvalMessage, toBellEntry } from "./approval-bell-entry";

const saved = (overrides: Partial<UserNotification>): UserNotification => ({
  id: "n-1",
  type: "Approval",
  applicationType: "Leave",
  applicationId: "a-1",
  approvalInstanceId: "i-1",
  applicationTypeLabel: "Leave",
  applicantName: "Ben Cruz",
  statusLabel: "Approved",
  createdAt: "2026-09-30T08:00:00Z",
  ...overrides,
});

describe("approvalMessage", () => {
  it("tells an approver a request is waiting on them, with the step", () => {
    expect(
      approvalMessage(
        saved({
          statusLabel: "Pending Your Approval",
          stepNumber: 2,
          totalSteps: 3,
        }),
      ),
    ).toBe("Ben Cruz's Leave application is waiting on you (step 2 of 3).");
  });

  it("tells the applicant a step cleared", () => {
    expect(
      approvalMessage(
        saved({ statusLabel: "Step Approved", stepNumber: 1, totalSteps: 2 }),
      ),
    ).toBe(
      "Your Leave application passed step 1 of 2 and moved to the next approver.",
    );
  });

  it("tells the applicant the outcome", () => {
    expect(approvalMessage(saved({ statusLabel: "Declined" }))).toBe(
      "Your Leave application was declined.",
    );
  });
});

describe("toBellEntry", () => {
  it("keeps the saved id and time, and flags a decline", () => {
    const entry = toBellEntry(saved({ statusLabel: "Declined" }));

    expect(entry.id).toBe("n-1");
    expect(entry.createdAt).toBe("2026-09-30T08:00:00Z");
    expect(entry.title).toBe("Leave — Declined");
    expect(entry.severity).toBe("warning");
  });
});
