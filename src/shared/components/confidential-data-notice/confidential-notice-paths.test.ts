import { describe, expect, it } from "vitest";
import {
  confidentialNoticeFor,
  showsConfidentialNotice,
} from "./confidential-notice-paths";

describe("confidentialNoticeFor", () => {
  it.each([
    ["/payroll/summary", "access"],
    ["/reports/tardiness", "access"],
    ["/daily-time-record/summary", "operations"],
    ["/daily-time-record/for-payroll", "operations"],
    ["/setup/employee", null],
  ])("%s needs %s", (path, clearance) => {
    expect(confidentialNoticeFor(path)).toBe(clearance);
  });
});

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
