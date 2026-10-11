import { describe, expect, it, vi } from "vitest";
import type { AuthUser } from "./auth-storage";
import {
  classifySessionChange,
  handleSessionStorageEvent,
  type SessionSyncDeps,
} from "./auth-session-sync";

const user = (over: Partial<AuthUser> = {}): AuthUser => ({
  email: "a@example.com",
  name: "A",
  roles: ["Owner"],
  permissions: [],
  tenantId: "t1",
  tenants: [],
  ...over,
});

describe("classifySessionChange", () => {
  it("reports nothing when no one is signed in before or after", () => {
    expect(classifySessionChange(null, null)).toBe("none");
  });

  it("detects a sign-in and a sign-out from another tab", () => {
    expect(classifySessionChange(null, user())).toBe("signed-in");
    expect(classifySessionChange(user(), null)).toBe("signed-out");
  });

  it("detects a different account, but treats an email that differs only by case as the same one", () => {
    expect(
      classifySessionChange(user(), user({ email: "b@example.com" })),
    ).toBe("account-switched");
    expect(
      classifySessionChange(user(), user({ email: "A@Example.com" })),
    ).toBe("refreshed");
  });

  it("detects a company switch for the same account", () => {
    expect(classifySessionChange(user(), user({ tenantId: "t2" }))).toBe(
      "tenant-changed",
    );
  });

  it("treats a same-account change (permissions, tenant list) as a refresh", () => {
    expect(
      classifySessionChange(user(), user({ permissions: ["Dashboard:View"] })),
    ).toBe("refreshed");
  });

  it("reports nothing for an identical session", () => {
    expect(classifySessionChange(user(), user())).toBe("none");
  });
});

describe("handleSessionStorageEvent", () => {
  const makeDeps = (session: AuthUser | null): SessionSyncDeps => ({
    readSession: () => session,
    clearCache: vi.fn(),
    restart: vi.fn(),
    notifyChange: vi.fn(),
  });

  it("clears the cache and restarts the tab when another tab signs in as someone else", () => {
    const other = user({ email: "b@example.com", tenantId: null });
    const deps = makeDeps(other);

    const known = handleSessionStorageEvent("auth_user", user(), deps);

    expect(deps.clearCache).toHaveBeenCalledOnce();
    expect(deps.restart).toHaveBeenCalledOnce();
    expect(known).toBe(other);
  });

  it("restarts the tab when another tab signs out (storage cleared)", () => {
    const deps = makeDeps(null);

    handleSessionStorageEvent(null, user(), deps);

    expect(deps.restart).toHaveBeenCalledOnce();
  });

  it("only re-notifies on a same-account refresh, without restarting", () => {
    const refreshed = user({ permissions: ["Dashboard:View"] });
    const deps = makeDeps(refreshed);

    handleSessionStorageEvent("auth_token", user(), deps);

    expect(deps.notifyChange).toHaveBeenCalledOnce();
    expect(deps.restart).not.toHaveBeenCalled();
    expect(deps.clearCache).not.toHaveBeenCalled();
  });

  it("ignores storage keys that are not the session", () => {
    const deps = makeDeps(user({ email: "b@example.com" }));
    const original = user();

    const known = handleSessionStorageEvent("theme", original, deps);

    expect(known).toBe(original);
    expect(deps.restart).not.toHaveBeenCalled();
    expect(deps.notifyChange).not.toHaveBeenCalled();
  });

  it("does nothing when the session did not actually change", () => {
    const deps = makeDeps(user());

    handleSessionStorageEvent("auth_user", user(), deps);

    expect(deps.restart).not.toHaveBeenCalled();
    expect(deps.notifyChange).not.toHaveBeenCalled();
  });
});
