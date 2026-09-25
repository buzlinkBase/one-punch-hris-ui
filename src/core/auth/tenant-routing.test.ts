import { beforeEach, describe, expect, it } from "vitest";
import { authStorage } from "./auth-storage";
import { resolveFallbackLanding } from "./tenant-routing";

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
    expect(resolveFallbackLanding()).toBe("/portal/profile");
  });

  // The post-accept hang: an Employee-only invitee whose permissions hadn't resolved used to
  // be bounced /dashboard -> /portal/profile -> /dashboard forever. /profile is permission-free,
  // so it's always a page they can actually stay on.
  it("sends an Employee-only member without portal access to their own profile", () => {
    signInAs(["Employee"], []);
    expect(resolveFallbackLanding()).toBe("/profile");
  });
});
