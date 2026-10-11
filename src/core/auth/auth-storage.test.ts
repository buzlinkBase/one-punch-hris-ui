import { beforeEach, describe, expect, it } from "vitest";
import {
  authStorage,
  CONFIDENTIAL_CLEARANCE_PERMISSION,
  CONFIDENTIAL_ENTRIES_PERMISSION,
  CONFIDENTIAL_OPERATIONS_PERMISSION,
} from "./auth-storage";

describe("authStorage.removeTenant", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clears the active company state when the current company is revoked", () => {
    authStorage.save("token", {
      email: "user@example.com",
      name: "User",
      roles: ["Admin"],
      permissions: ["Users:View"],
      tenantId: "tenant-1",
      tenantName: "Acme",
      tenants: [
        {
          tenantId: "tenant-1",
          name: "Acme",
          roles: ["Admin"],
          permissions: ["Users:View"],
          hrDbReady: true,
          hrDbStatus: "Ready",
          state: "Created",
        },
        {
          tenantId: "tenant-2",
          name: "Beta",
          roles: ["Admin"],
          permissions: ["Users:View"],
          hrDbReady: true,
          hrDbStatus: "Ready",
          state: "Created",
        },
      ],
    });

    authStorage.removeTenant("tenant-1");

    const user = authStorage.getUser();
    expect(user?.tenantId).toBeNull();
    expect(user?.tenantName).toBeNull();
    expect(user?.roles).toEqual([]);
    expect(user?.permissions).toEqual([]);
    expect(user?.tenants).toEqual([
      {
        tenantId: "tenant-2",
        name: "Beta",
        roles: ["Admin"],
        permissions: ["Users:View"],
        hrDbReady: true,
        hrDbStatus: "Ready",
        state: "Created",
      },
    ]);
  });
});

describe("authStorage.renameTenant", () => {
  const tenant = (tenantId: string, name: string) => ({
    tenantId,
    name,
    roles: ["Admin"],
    permissions: [],
    hrDbReady: true,
    hrDbStatus: "Ready",
    state: "Created",
  });

  beforeEach(() => {
    localStorage.clear();
    authStorage.save("token", {
      email: "user@example.com",
      name: "User",
      roles: ["Admin"],
      permissions: [],
      tenantId: "tenant-1",
      tenantName: "My Space",
      tenants: [tenant("tenant-1", "My Space"), tenant("tenant-2", "Beta")],
    });
  });

  it("renames the active company and its switcher entry", () => {
    authStorage.renameTenant("tenant-1", "Acme Corp");

    const user = authStorage.getUser();
    expect(user?.tenantName).toBe("Acme Corp");
    expect(user?.tenants?.map((t) => t.name)).toEqual(["Acme Corp", "Beta"]);
  });

  it("leaves the active company's name alone when another company is renamed", () => {
    authStorage.renameTenant("tenant-2", "Beta Renamed");

    const user = authStorage.getUser();
    expect(user?.tenantName).toBe("My Space");
    expect(user?.tenants?.map((t) => t.name)).toEqual([
      "My Space",
      "Beta Renamed",
    ]);
  });
});

describe("authStorage.hasConfidentialClearance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const signIn = (roles: string[], permissions: string[] = []) =>
    authStorage.save("token", {
      email: "user@example.com",
      name: "User",
      roles,
      permissions,
    });

  it("clears the Owner without an explicit grant", () => {
    signIn(["Owner"]);
    expect(authStorage.hasConfidentialClearance()).toBe(true);
  });

  it("does not clear an Admin without the grant", () => {
    signIn(["Admin"], ["Workforce Setup:View"]);
    expect(authStorage.hasConfidentialClearance()).toBe(false);
  });

  it("clears any role granted the permission", () => {
    signIn(["HR"], [CONFIDENTIAL_CLEARANCE_PERMISSION]);
    expect(authStorage.hasConfidentialClearance()).toBe(true);
  });
});

describe("authStorage.getConfidentialGrants", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const signIn = (roles: string[], permissions: string[] = []) =>
    authStorage.save("token", {
      email: "user@example.com",
      name: "User",
      roles,
      permissions,
    });

  it("reads each partial clearance from its own permission", () => {
    signIn(["HR"], [CONFIDENTIAL_OPERATIONS_PERMISSION]);
    expect(authStorage.getConfidentialGrants()).toEqual({
      operations: true,
      entries: false,
    });

    signIn(["HR"], [CONFIDENTIAL_ENTRIES_PERMISSION]);
    expect(authStorage.getConfidentialGrants()).toEqual({
      operations: false,
      entries: true,
    });
  });

  it("gives an Admin without the grants neither", () => {
    signIn(["Admin"]);
    expect(authStorage.getConfidentialGrants()).toEqual({
      operations: false,
      entries: false,
    });
  });
});
