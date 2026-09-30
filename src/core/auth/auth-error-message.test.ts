import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { authErrorMessage } from "./auth-error-message";

function httpError(status: number, data: unknown): AxiosError {
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, null, {
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  });
}

describe("authErrorMessage", () => {
  it("shows the API's own reason", () => {
    const body = { data: { errorMessage: "Account is locked." } };
    const err = httpError(400, body);

    expect(authErrorMessage(err, "Invalid email or password.")).toBe(
      "Account is locked.",
    );
  });

  it("says to wait after too many attempts, not that the password is wrong", () => {
    const detail = "Too many requests. Please wait 42 seconds and try again.";
    const err = httpError(429, { data: { detail } });

    expect(authErrorMessage(err, "Invalid email or password.")).toBe(detail);
  });

  it("falls back when the response says nothing", () => {
    expect(authErrorMessage(httpError(500, {}), "Login failed.")).toBe(
      "Login failed.",
    );
  });

  it("handles errors that aren't HTTP responses", () => {
    expect(authErrorMessage(new Error("boom"), "Login failed.")).toBe(
      "An unexpected error occurred.",
    );
  });
});
