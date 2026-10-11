import { describe, expect, it } from "vitest";
import {
  resolveInviteChipStatus,
  type InviteLookup,
} from "./invite-chip-status";

const lookup = (
  check: Partial<InviteLookup["checks"][number]>,
  match: Partial<InviteLookup["matches"][number]>,
): InviteLookup => ({
  checks: [{ email: "jane@site.com", status: "Ok", ...check }],
  matches: [{ email: "jane@site.com", status: "Matched", ...match }],
});

describe("resolveInviteChipStatus", () => {
  it("flags invalid syntax without waiting for the lookup", () => {
    const status = resolveInviteChipStatus(
      "invalid-email",
      "Employee",
      undefined,
    );
    expect(status.tone).toBe("invalid");
    expect(status.blocked).toBe(true);
  });

  it("is checking until both lookups answered", () => {
    expect(
      resolveInviteChipStatus("jane@site.com", "Employee", undefined).tone,
    ).toBe("checking");
  });

  it("blocks an existing member, naming them", () => {
    const status = resolveInviteChipStatus(
      "jane@site.com",
      "Employee",
      lookup({ status: "Member", name: "Jane Doe" }, {}),
    );
    expect(status).toMatchObject({ tone: "member", blocked: true });
    expect(status.message).toContain(
      "User Jane Doe is already an active member",
    );
  });

  it("blocks a cross-entity conflict", () => {
    expect(
      resolveInviteChipStatus(
        "jane@site.com",
        "Employee",
        lookup({}, { status: "ClientLogin" }),
      ),
    ).toMatchObject({ tone: "conflict", blocked: true });
    expect(
      resolveInviteChipStatus(
        "jane@site.com",
        "Client",
        lookup({}, { status: "EmployeeEmail" }),
      ).message,
    ).toContain("already registered as an active Employee");
  });

  it("blocks an active pending invite, with its date", () => {
    const status = resolveInviteChipStatus(
      "jane@site.com",
      "Employee",
      lookup({ status: "PendingInvite", sentAt: "2026-09-28T08:00:00Z" }, {}),
    );
    expect(status).toMatchObject({ tone: "pending", blocked: true });
    expect(status.message).toContain("Sep 28, 2026");
  });

  it("blocks an email with no employee record", () => {
    expect(
      resolveInviteChipStatus(
        "jane@site.com",
        "Employee",
        lookup({}, { status: "NoEmployee" }),
      ).blocked,
    ).toBe(true);
  });

  it("is ready with the matched employee", () => {
    const status = resolveInviteChipStatus(
      "jane@site.com",
      "Employee",
      lookup({}, { status: "Matched", employeeId: "emp-1", name: "Jane Doe" }),
    );
    expect(status).toMatchObject({
      tone: "ready",
      blocked: false,
      employeeId: "emp-1",
      name: "Jane Doe",
    });
  });
});
