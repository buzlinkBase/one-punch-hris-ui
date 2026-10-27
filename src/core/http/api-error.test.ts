import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { apiErrorMessage, httpStatusOf } from "./api-error";

function httpError(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError("failed", "ERR_BAD_RESPONSE", config, null, {
    status,
    statusText: "",
    headers: {},
    config,
    data,
  });
}

describe("apiErrorMessage", () => {
  it("prefers the ProblemDetails detail", () => {
    const err = httpError(400, { data: { detail: "Cutoff is locked." } });
    expect(apiErrorMessage(err, "Failed.")).toBe("Cutoff is locked.");
  });

  it("accepts a plain-string data payload", () => {
    const err = httpError(400, { data: "Email already invited." });
    expect(apiErrorMessage(err, "Failed.")).toBe("Email already invited.");
  });

  it("falls back when there's nothing to show", () => {
    expect(apiErrorMessage(httpError(500, {}), "Failed.")).toBe("Failed.");
    expect(apiErrorMessage(new Error("boom"), "Failed.")).toBe("Failed.");
  });
});

describe("httpStatusOf", () => {
  it("reads the status of an answered request only", () => {
    expect(httpStatusOf(httpError(401, {}))).toBe(401);
    expect(httpStatusOf(new Error("boom"))).toBeUndefined();
  });
});
