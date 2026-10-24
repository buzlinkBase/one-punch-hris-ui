import { beforeEach, describe, expect, it, vi } from "vitest";
import { authStorage } from "./auth-storage";
import {
  resolveFallbackLanding,
  resolveTenantDestination,
} from "./tenant-routing";

const refreshAccessToken = vi.fn();
const getPendingInvitation = vi.fn();
const selectTenant = vi.fn();

vi.mock("./auth-refresh", () => ({
  refreshAccessToken: (force?: boolean) => refreshAccessToken(force),
}));
vi.mock("@/app/modules/auth/login/services/auth.api", () => ({
  authApi: {
    getPendingInvitation: () => getPendingInvitation(),
    selectTenant: (id: string) => selectTenant(id),
  },
}));

const tenant = (id: string) => ({
  tenantId: id,
  name: `Company ${id}`,
  hrDbReady: true,
  hrDbStatus: "Ready",
  state: "Created",
  roles: ["Owner"],
  permissions: [],
});

const signInAs = (roles: string[], permissions: string[]) =>
  authStorage.save("token", {
    email: "user@example.com",
    name: "User",
    roles,
    permissions,
    tenantId: "tenant-1",
    tenants: [],
  });

describe("resolveFallbackLanding", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lands on the dashboard when the role grants it", () => {
    signInAs(["Admin"], ["Dashboard:View", "Leave:View"]);
    expect(resolveFallbackLanding()).toBe("/dashboard");
  });

  it("lands on the first menu page the role can open when the dashboard isn't granted", () => {
    signInAs(["Member"], ["Leave:View"]);
    expect(resolveFallbackLanding()).toBe("/applications/leave");
  });

  it("never picks a group header's own section path", () => {
    signInAs(["Member"], ["Payroll Reports:View"]);
    expect(resolveFallbackLanding()).toBe("/payroll/reports/bank-disbursement");
  });

  it("lands a role with no permissions on its own profile", () => {
    signInAs(["Member"], []);
    expect(resolveFallbackLanding()).toBe("/profile");
  });

  it("lands Owner on the dashboard", () => {
    signInAs(["Owner"], []);
    expect(resolveFallbackLanding()).toBe("/dashboard");
  });

  it("sends an Employee-only member with portal access to the portal", () => {
    signInAs(["Employee"], ["Employee Self-Service Portal:View"]);
    expect(resolveFallbackLanding()).toBe("/portal/dashboard");
  });

  // The post-accept hang: an Employee-only invitee whose permissions hadn't resolved used to
  // be bounced /dashboard -> /portal/profile -> /dashboard forever. /profile is permission-free,
  // so it's always a page they can actually stay on.
  it("sends an Employee-only member without portal access to their own profile", () => {
    signInAs(["Employee"], []);
    expect(resolveFallbackLanding()).toBe("/profile");
  });
});

// The session in localStorage is shared by every tab, so an empty local company list can belong
// to a different account or be stale -- "no company" must be confirmed by the server before a
// user is sent to company setup.
describe("resolveTenantDestination", () => {
  const signedInWithoutTenant = () =>
    authStorage.save("token", {
      email: "a@example.com",
      name: "A",
      roles: [],
      permissions: [],
      tenantId: null,
      tenants: [],
    });

  beforeEach(() => {
    localStorage.clear();
    refreshAccessToken.mockReset();
    getPendingInvitation.mockReset();
    selectTenant.mockReset();
  });

  it("does not ask the server when a tenant is already active", async () => {
    signInAs(["Owner"], []);

    expect(await resolveTenantDestination()).toBeNull();
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });

  it("does not send an existing user to company setup when the server still knows their company", async () => {
    signedInWithoutTenant();
    refreshAccessToken.mockImplementation(async () => {
      authStorage.save("fresh", {
        email: "a@example.com",
        name: "A",
        roles: ["Owner"],
        permissions: [],
        tenantId: "t1",
        tenants: [tenant("t1")],
      });
    });

    expect(await resolveTenantDestination()).toBeNull();
    expect(refreshAccessToken).toHaveBeenCalledWith(true);
    expect(getPendingInvitation).not.toHaveBeenCalled();
  });

  it("sends a user with several companies to the picker after the server confirms them", async () => {
    signedInWithoutTenant();
    refreshAccessToken.mockImplementation(async () => {
      authStorage.save("fresh", {
        email: "a@example.com",
        name: "A",
        roles: [],
        permissions: [],
        tenantId: null,
        tenants: [tenant("t1"), tenant("t2")],
      });
    });

    expect(await resolveTenantDestination()).toBe("/select-tenant");
  });

  it("sends a genuinely new user to company setup only after the server also reports no company", async () => {
    signedInWithoutTenant();
    refreshAccessToken.mockResolvedValue("fresh");
    getPendingInvitation.mockResolvedValue(null);

    expect(await resolveTenantDestination()).toBe("/create-tenant");
    expect(refreshAccessToken).toHaveBeenCalledOnce();
  });

  it("goes to the invitation screen instead when one is pending", async () => {
    signedInWithoutTenant();
    refreshAccessToken.mockResolvedValue("fresh");
    getPendingInvitation.mockResolvedValue({ id: "inv" });

    expect(await resolveTenantDestination()).toBe("/awaiting-invitation");
  });

  it("never falls through to company setup when the server can't be reached", async () => {
    signedInWithoutTenant();
    refreshAccessToken.mockRejectedValue(new Error("network"));

    await expect(resolveTenantDestination()).rejects.toThrow("network");
    expect(getPendingInvitation).not.toHaveBeenCalled();
  });
});
