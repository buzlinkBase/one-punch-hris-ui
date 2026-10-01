import { describe, expect, it } from "vitest";
import { toPlanRestriction } from "./plan-restriction";

describe("toPlanRestriction", () => {
  it("reads a plan-required refusal with its feature", () => {
    expect(
      toPlanRestriction({
        status: 403,
        data: {
          type: "plan-required",
          detail: "Your plan doesn't include this feature.",
          feature: "payroll.core",
        },
      }),
    ).toEqual({
      type: "plan-required",
      detail: "Your plan doesn't include this feature.",
      feature: "payroll.core",
      limit: undefined,
      max: null,
      used: undefined,
    });
  });

  it("reads a limit with its counts", () => {
    const restriction = toPlanRestriction({
      data: {
        type: "plan-limit-reached",
        detail: "Limit reached",
        limit: "employees.max",
        max: 100,
        used: 100,
      },
    });

    expect(restriction?.limit).toBe("employees.max");
    expect(restriction?.max).toBe(100);
    expect(restriction?.used).toBe(100);
  });

  it("ignores every other error", () => {
    expect(
      toPlanRestriction({ data: { type: "https://httpstatuses.com/403" } }),
    ).toBeNull();
    expect(toPlanRestriction({ data: "Forbidden" })).toBeNull();
    expect(toPlanRestriction(undefined)).toBeNull();
  });
});
