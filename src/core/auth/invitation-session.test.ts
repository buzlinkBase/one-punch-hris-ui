import { beforeEach, describe, expect, it } from "vitest";
import { authStorage } from "./auth-storage";
import { saveInvitationSession } from "./invitation-session";
import type { TenantSummary } from "@/app/modules/auth/login/models/api/response/tenant-summary.model";

const fakeJwt = (payload: Record<string, unknown>) =>
  `header.${btoa(JSON.stringify(payload))}.signature`;

const tenant = (tenantId: string, name: string): TenantSummary => ({
  tenantId,
  name,
  state: "Active",
  roles: ["Member"],
  permissions: [],
  hrDbStatus: "Created",
  hrDbReady: true,
});

describe("saveInvitationSession", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves the accept response's token and scopes the session to its tenant claim", () => {
    const token = fakeJwt({ tenantId: "joined", tenantName: "Joined Co" });

    saveInvitationSession({
      accessToken: token,
      email: "invitee@example.com",
      name: "Invitee",
      roles: ["Employee"],
      permissions: ["Employee Self-Service Portal:View"],
      tenants: [tenant("joined", "Joined Co")],
    });

    expect(authStorage.getToken()).toBe(token);
    expect(authStorage.getTenantId()).toBe("joined");
    expect(authStorage.getTenantName()).toBe("Joined Co");
    expect(authStorage.getPermissions()).toEqual([
      "Employee Self-Service Portal:View",
    ]);
  });

  it("keeps companies the response omits when the stored session is the same account", () => {
    authStorage.save("old-token", {
      email: "Invitee@Example.com",
      name: "Invitee",
      roles: ["Owner"],
      permissions: [],
      tenantId: "own",
      tenants: [tenant("own", "Own Co")],
    });

    saveInvitationSession({
      accessToken: fakeJwt({ tenantId: "joined" }),
      email: "invitee@example.com",
      name: "Invitee",
      roles: ["Member"],
      permissions: [],
      tenants: [tenant("joined", "Joined Co")],
    });

    expect(authStorage.getTenants().map((t) => t.tenantId)).toEqual([
      "joined",
      "own",
    ]);
  });

  it("does not inherit another account's companies from a leftover session", () => {
    authStorage.save("someone-elses-token", {
      email: "someone.else@example.com",
      name: "Someone Else",
      roles: ["Owner"],
      permissions: [],
      tenantId: "theirs",
      tenants: [tenant("theirs", "Their Co")],
    });

    saveInvitationSession({
      accessToken: fakeJwt({ tenantId: "joined" }),
      email: "invitee@example.com",
      name: "Invitee",
      roles: ["Member"],
      permissions: [],
      tenants: [tenant("joined", "Joined Co")],
    });

    expect(authStorage.getTenants().map((t) => t.tenantId)).toEqual(["joined"]);
    expect(authStorage.getUser()?.email).toBe("invitee@example.com");
  });

  it("falls back to the first listed tenant when the token carries no tenant claim", () => {
    saveInvitationSession({
      accessToken: fakeJwt({}),
      email: "invitee@example.com",
      name: "Invitee",
      roles: ["Member"],
      permissions: [],
      tenants: [tenant("joined", "Joined Co")],
    });

    expect(authStorage.getTenantId()).toBe("joined");
    expect(authStorage.getTenantName()).toBe("Joined Co");
  });
});
