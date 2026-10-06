import { describe, expect, it, vi } from "vitest";
import type { AuthUser } from "./auth-storage";
import { buildRefreshedUser } from "./auth-refresh";

vi.mock("@/app/modules/auth/login/services/auth.api", () => ({
  authApi: { refresh: vi.fn() },
}));

const tenant = (id: string) => ({
  tenantId: id,
  name: `Company ${id}`,
  state: "Created",
  roles: ["Owner"],
  permissions: [],
  hrDbStatus: "Ready",
  hrDbReady: true,
});

const stored = (over: Partial<AuthUser> = {}): AuthUser => ({
  email: "a@example.com",
  name: "A",
  roles: ["Owner"],
  permissions: ["Dashboard:View"],
  tenantId: "t1",
  tenantName: "Company t1",
  tenants: [tenant("t1")],
  ...over,
});

const response = (over: Record<string, unknown> = {}) =>
  ({
    accessToken: "token",
    email: "a@example.com",
    name: "A",
    roles: ["Owner"],
    permissions: ["Dashboard:View"],
    tenants: [tenant("t1")],
    ...over,
  }) as Parameters<typeof buildRefreshedUser>[1];

describe("buildRefreshedUser", () => {
  it("keeps the locally-known companies the server omits for the same account", () => {
    const user = buildRefreshedUser(
      stored({ tenants: [tenant("t1"), tenant("t2")] }),
      response({ tenants: [tenant("t1")] }),
    );

    expect(user.tenants?.map((t) => t.tenantId)).toEqual(["t1", "t2"]);
    expect(user.tenantId).toBe("t1");
  });

  it("matches the account case-insensitively", () => {
    const user = buildRefreshedUser(
      stored({ email: "A@Example.com" }),
      response({ tenants: [] }),
    );

    expect(user.tenants?.map((t) => t.tenantId)).toEqual(["t1"]);
  });

  it("does not hand another account's companies to the account the refresh cookie belongs to", () => {
    const user = buildRefreshedUser(
      stored(),
      response({ email: "b@example.com", name: "B", tenants: [] }),
    );

    expect(user.email).toBe("b@example.com");
    expect(user.name).toBe("B");
    expect(user.tenants).toEqual([]);
    expect(user.tenantId).toBeNull();
    expect(user.tenantName).toBeNull();
  });

  it("starts clean when no session was stored", () => {
    const user = buildRefreshedUser(
      null,
      response({ tenants: [tenant("t9")] }),
    );

    expect(user.email).toBe("a@example.com");
    expect(user.tenants?.map((t) => t.tenantId)).toEqual(["t9"]);
  });

  it("keeps the stored account when the response carries no email", () => {
    const user = buildRefreshedUser(stored(), response({ email: "" }));

    expect(user.email).toBe("a@example.com");
    expect(user.tenantId).toBe("t1");
  });
});
