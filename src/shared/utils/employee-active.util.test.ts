import { describe, expect, it } from "vitest";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import {
  isPayrollOnlyInRange,
  isPayrollOnlyThroughout,
} from "./employee-active.util";

const withWindow = (
  isNoDTRNotRequired: boolean,
  noDtrEffectiveFrom: string | null,
  noDtrEffectiveUntil: string | null,
) =>
  ({
    settings: { isNoDTRNotRequired, noDtrEffectiveFrom, noDtrEffectiveUntil },
  }) as Pick<EmployeeResponse, "settings">;

const FROM = "2026-08-01";
const TO = "2026-08-15";

describe("isPayrollOnlyInRange", () => {
  it("is false when the flag is off or settings are missing", () => {
    expect(isPayrollOnlyInRange(withWindow(false, null, null), FROM, TO)).toBe(
      false,
    );
    expect(isPayrollOnlyInRange({ settings: undefined }, FROM, TO)).toBe(false);
  });

  it("treats a missing bound as open-ended", () => {
    expect(isPayrollOnlyInRange(withWindow(true, null, null), FROM, TO)).toBe(
      true,
    );
    expect(
      isPayrollOnlyInRange(withWindow(true, "2026-01-01", null), FROM, TO),
    ).toBe(true);
  });

  it("is true when the window only touches part of the range", () => {
    expect(
      isPayrollOnlyInRange(withWindow(true, "2026-08-10", null), FROM, TO),
    ).toBe(true);
    expect(
      isPayrollOnlyInRange(withWindow(true, null, "2026-08-02"), FROM, TO),
    ).toBe(true);
  });

  it("is false when the window starts after or ends before the range", () => {
    expect(
      isPayrollOnlyInRange(withWindow(true, "2026-08-16", null), FROM, TO),
    ).toBe(false);
    expect(
      isPayrollOnlyInRange(withWindow(true, null, "2026-07-31"), FROM, TO),
    ).toBe(false);
  });
});

describe("isPayrollOnlyThroughout", () => {
  it("is true only when the window covers every day of the range", () => {
    expect(
      isPayrollOnlyThroughout(withWindow(true, "2026-08-01", null), FROM, TO),
    ).toBe(true);
    expect(
      isPayrollOnlyThroughout(withWindow(true, "2026-08-02", null), FROM, TO),
    ).toBe(false);
    expect(
      isPayrollOnlyThroughout(withWindow(true, null, "2026-08-14"), FROM, TO),
    ).toBe(false);
  });
});
