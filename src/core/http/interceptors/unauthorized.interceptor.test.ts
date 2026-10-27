import { describe, expect, it } from "vitest";
import { AxiosHeaders, type AxiosError } from "axios";
import { shouldRecoverFromUnauthorized } from "./unauthorized.interceptor";

function errorFor({
  status = 401,
  url = "hrms/api/v1/employees",
  token = "abc" as string | null,
  retried = false,
} = {}): AxiosError {
  const headers = new AxiosHeaders();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return {
    config: { url, headers, _authRetried: retried },
    response: { status },
  } as unknown as AxiosError;
}

describe("shouldRecoverFromUnauthorized", () => {
  it("recovers a 401 on an authenticated request", () => {
    expect(shouldRecoverFromUnauthorized(errorFor())).toBe(true);
  });

  it("ignores other statuses", () => {
    expect(shouldRecoverFromUnauthorized(errorFor({ status: 403 }))).toBe(
      false,
    );
  });

  it("replays at most once", () => {
    expect(shouldRecoverFromUnauthorized(errorFor({ retried: true }))).toBe(
      false,
    );
  });

  it("ignores requests sent without a token", () => {
    expect(shouldRecoverFromUnauthorized(errorFor({ token: null }))).toBe(
      false,
    );
  });

  it("leaves anonymous auth endpoints alone", () => {
    for (const path of ["login", "refresh", "logout", "reset-password"]) {
      expect(
        shouldRecoverFromUnauthorized(
          errorFor({ url: `auth/api/v1/users/${path}` }),
        ),
      ).toBe(false);
    }
  });

  it("still recovers other user endpoints", () => {
    expect(
      shouldRecoverFromUnauthorized(
        errorFor({ url: "auth/api/v1/users/set-default-tenant" }),
      ),
    ).toBe(true);
  });
});
