import { beforeEach, describe, expect, it } from "vitest";
import { authStorage } from "./auth-storage";

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
