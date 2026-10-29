import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authStorage } from "./auth-storage";
import { refreshAccessToken } from "./auth-refresh";
import { ImpersonationEndedError } from "./impersonation";

vi.mock("@/app/modules/auth/login/services/auth.api", () => ({
  authApi: { refresh: vi.fn() },
}));
vi.mock("@/app/modules/auth/impersonation/services/impersonation.api", () => ({
  impersonationApi: { exchange: vi.fn(), stop: vi.fn() },
}));

const info = {
  sessionId: "session-1",
  operatorEmail: "ops@platform.test",
  expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
};

const user = {
  email: "ann@acme.test",
  name: "Ann",
  roles: ["Employee"],
  permissions: ["Leave:View"],
  tenantId: "t1",
  tenantName: "Acme",
  tenants: [],
};

describe("impersonation session storage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the impersonated session in this tab's sessionStorage and never in localStorage", () => {
    authStorage.startImpersonation(info);
    authStorage.save("imp-token", user);

    expect(sessionStorage.getItem("auth_token")).toBe("imp-token");
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("auth_user")).toBeNull();
    expect(authStorage.isImpersonating()).toBe(true);
    expect(authStorage.getImpersonation()?.operatorEmail).toBe(
      "ops@platform.test",
    );
  });

  it("does not disturb a real session saved by another tab", () => {
    authStorage.save("real-token", { ...user, email: "boss@acme.test" });
    authStorage.startImpersonation(info);
    authStorage.save("imp-token", user);

    expect(localStorage.getItem("auth_token")).toBe("real-token");
    expect(authStorage.getToken()).toBe("imp-token");
  });

  it("clear() wipes the impersonation session and its marker", () => {
    authStorage.startImpersonation(info);
    authStorage.save("imp-token", user);

    authStorage.clear();

    expect(sessionStorage.getItem("auth_token")).toBeNull();
    expect(sessionStorage.getItem("auth_user")).toBeNull();
    expect(authStorage.isImpersonating()).toBe(false);
  });

  it("is a normal session when nothing started impersonation", () => {
    authStorage.save("real-token", user);

    expect(authStorage.isImpersonating()).toBe(false);
    expect(localStorage.getItem("auth_token")).toBe("real-token");
  });
});

describe("refreshing an impersonation session", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("never refreshes: it flushes the tab and throws", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign });
    authStorage.startImpersonation(info);
    authStorage.save("imp-token", user);

    await expect(refreshAccessToken()).rejects.toBeInstanceOf(
      ImpersonationEndedError,
    );

    expect(authStorage.getToken()).toBeNull();
    expect(assign).toHaveBeenCalledWith("/impersonation-ended");
    vi.unstubAllGlobals();
  });
});
