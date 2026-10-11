import { describe, expect, it } from "vitest";
import type { UserLinkResponse } from "../models/api/response/user-link-response.model";
import type { UserResponse } from "../models/api/response/user-response.model";
import { EMPTY_GUID, classifyUsers } from "./classify-users";

const member = (overrides: Partial<UserResponse>): UserResponse => ({
  id: "m-1",
  userId: "u-1",
  email: "someone@acme.com",
  fullName: "Someone",
  roles: ["Employee"],
  status: "Active",
  ...overrides,
});

const link = (overrides: Partial<UserLinkResponse>): UserLinkResponse => ({
  userId: null,
  email: "someone@acme.com",
  type: "Employee",
  employeeId: null,
  employeeNo: null,
  departmentName: null,
  clientId: null,
  clientCode: null,
  clientName: null,
  name: null,
  ...overrides,
});

describe("classifyUsers", () => {
  it("links an accepted account by its user id", () => {
    const [row] = classifyUsers(
      [member({ userId: "u-9", email: "other@acme.com" })],
      [link({ userId: "u-9", type: "Client", clientName: "Metro Retail" })],
    );

    expect(row.kind).toBe("Client");
    expect(row.link?.clientName).toBe("Metro Retail");
  });

  it("links a pending invite by email, ignoring case and spaces", () => {
    const [row] = classifyUsers(
      [
        member({
          userId: EMPTY_GUID,
          email: " Ana@Acme.com",
          status: "Invited",
        }),
      ],
      [link({ email: "ana@acme.com", employeeNo: "E-002" })],
    );

    expect(row.kind).toBe("Employee");
    expect(row.link?.employeeNo).toBe("E-002");
  });

  it("prefers the user id link over an email link", () => {
    const [row] = classifyUsers(
      [member({ userId: "u-1", email: "shared@acme.com" })],
      [
        link({ email: "shared@acme.com", type: "Employee" }),
        link({ userId: "u-1", email: "shared@acme.com", type: "Client" }),
      ],
    );

    expect(row.kind).toBe("Client");
  });

  it("treats a pending client invite as a client user by its role", () => {
    const [row] = classifyUsers(
      [member({ userId: EMPTY_GUID, roles: ["Client"], status: "Invited" })],
      [],
    );

    expect(row.kind).toBe("Client");
    expect(row.link).toBeUndefined();
  });

  it("marks members tied to no record as other", () => {
    const [row] = classifyUsers([member({ roles: ["Admin"] })], []);

    expect(row.kind).toBe("Other");
  });
});
