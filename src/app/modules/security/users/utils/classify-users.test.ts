import { describe, expect, it } from "vitest";
import type { UserLinkResponse } from "../models/api/response/user-link-response.model";
import type {
  ClientUserResponse,
  UserResponse,
} from "../models/api/response/user-response.model";
import {
  EMPTY_GUID,
  classifyUsers,
  mergeClientUsers,
  portalClientRow,
} from "./classify-users";

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

const portalUser = (
  overrides: Partial<ClientUserResponse>,
): ClientUserResponse => ({
  clientEntityId: "c-1",
  clientName: "Acme Corp",
  membershipId: "pm-1",
  userId: "u-9",
  fullName: "Portal Person",
  email: "portal@acme.com",
  status: "Active",
  ownStatus: "Active",
  roles: [{ id: "r-1", name: "Client Admin" }],
  ...overrides,
});

describe("portalClientRow", () => {
  it("shows a portal user as a client row tied to its client", () => {
    const row = portalClientRow(portalUser({}));

    expect(row).toMatchObject({
      kind: "Client",
      email: "portal@acme.com",
      roles: ["Client Admin"],
      status: "Active",
      link: { clientId: "c-1", clientName: "Acme Corp" },
      portal: { clientEntityId: "c-1", membershipId: "pm-1" },
    });
  });

  it("gives one person in two clients two distinct rows", () => {
    const first = portalClientRow(portalUser({ clientEntityId: "c-1" }));
    const second = portalClientRow(portalUser({ clientEntityId: "c-2" }));

    expect(first.id).not.toBe(second.id);
  });
});

describe("mergeClientUsers", () => {
  const staff = classifyUsers([member({ id: "m-1", userId: "u-1" })], []);

  it("returns the rows untouched when there are no portal users", () => {
    expect(mergeClientUsers(staff, [])).toBe(staff);
  });

  it("adds the portal users after the company's own rows", () => {
    const merged = mergeClientUsers(staff, [portalUser({})]);

    expect(merged.map((row) => row.kind)).toEqual(["Other", "Client"]);
  });

  it("shows an older client login once, as the portal user", () => {
    const legacy = classifyUsers(
      [member({ id: "m-2", userId: "u-9", roles: ["Client"] })],
      [
        link({
          userId: "u-9",
          type: "Client",
          clientId: "c-1",
          clientName: "Acme Corp",
        }),
      ],
    );

    const merged = mergeClientUsers(legacy, [portalUser({})]);

    expect(merged).toHaveLength(1);
    expect(merged[0].portal?.membershipId).toBe("pm-1");
  });

  it("keeps an older client login for a different client", () => {
    const legacy = classifyUsers(
      [member({ id: "m-2", userId: "u-9", roles: ["Client"] })],
      [link({ userId: "u-9", type: "Client", clientId: "c-2" })],
    );

    expect(mergeClientUsers(legacy, [portalUser({})])).toHaveLength(2);
  });
});
