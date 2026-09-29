import { describe, expect, it } from "vitest";
import { showsConfidentialNotice } from "./confidential-notice-paths";

describe("showsConfidentialNotice", () => {
  it.each([
    "/payroll/summary",
    "/payroll/reports/sss-remittance",
    "/reports/tardiness",
    "/daily-time-record/summary",
    "/daily-time-record/for-payroll",
  ])("shows on %s", (path) => {
    expect(showsConfidentialNotice(path)).toBe(true);
  });

  it.each(["/setup/employee", "/daily-time-record/detail", "/dashboard"])(
    "hides on %s",
    (path) => {
      expect(showsConfidentialNotice(path)).toBe(false);
    },
  );
});
