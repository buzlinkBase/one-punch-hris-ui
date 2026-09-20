import { describe, expect, it } from "vitest";
import type { UserResponse } from "../models/api/response/user-response.model";
import { isDuplicateTenantMemberEmail } from "./tenant-member-email.util";

describe("isDuplicateTenantMemberEmail", () => {
  it("returns true when the email matches an existing tenant member regardless of case", () => {
    const members: UserResponse[] = [
      {
        id: "1",
        userId: "u-1",
        email: "Alice@Example.com",
        fullName: "Alice Example",
        roles: ["Employee"],
        status: "Active",
      },
    ];

    expect(isDuplicateTenantMemberEmail(members, "alice@example.com")).toBe(
      true,
    );
  });

  it("returns false when the email is not yet a tenant member", () => {
    const members: UserResponse[] = [
      {
        id: "1",
        userId: "u-1",
        email: "bob@example.com",
        fullName: "Bob Example",
        roles: ["Employee"],
        status: "Active",
      },
    ];

    expect(isDuplicateTenantMemberEmail(members, "carol@example.com")).toBe(
      false,
    );
  });
});
