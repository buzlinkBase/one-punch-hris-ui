import { describe, expect, it } from "vitest";
import {
  applicationListTarget,
  dtrTarget,
  employeeListTarget,
  isApplicationKind,
  payrollRunTarget,
  readApplicationDrill,
  readDtrDrill,
  readEmployeeDrill,
} from "./drill-screens";

describe("employee list drill", () => {
  it("round-trips the filters it sets and leaves empty ones out of the URL", () => {
    const target = employeeListTarget({
      departmentIds: ["d1"],
      branchIds: [],
      hireDateFrom: "2026-10-01",
    });

    expect(target.to).toBe("/setup/employee");
    expect(target.search).toEqual({
      drill: 1,
      departmentIds: ["d1"],
      hireDateFrom: "2026-10-01",
    });
    expect(readEmployeeDrill(target.search ?? {})).toEqual({
      departmentIds: ["d1"],
      hireDateFrom: "2026-10-01",
    });
  });

  it("clears the list even for a drill with no filters, but not for a normal visit", () => {
    expect(readEmployeeDrill(employeeListTarget({}).search ?? {})).toEqual({});
    expect(readEmployeeDrill({ departmentIds: ["d1"] })).toBeNull();
  });

  it("ignores malformed values", () => {
    expect(
      readEmployeeDrill({
        drill: 1,
        departmentIds: [""],
        hireDateTo: "yesterday",
      }),
    ).toEqual({});
    expect(readEmployeeDrill({ drill: 1, genders: "Female" })).toEqual({
      genders: ["Female"],
    });
  });
});

describe("DTR drill", () => {
  it("opens for whoever may calculate DTR, and needs a full range", () => {
    const target = dtrTarget(
      { from: "2026-10-01", to: "2026-10-15" },
      { departmentId: "d1" },
    );

    expect(target.permission).toBe("DTR Master:View");
    expect(readDtrDrill(target.search ?? {})).toEqual({
      fromDate: "2026-10-01",
      toDate: "2026-10-15",
      departmentId: "d1",
    });
    expect(readDtrDrill({ fromDate: "2026-10-01" })).toBeNull();
  });
});

describe("request list drill", () => {
  it("maps each kind to its list and round-trips range and tab", () => {
    const target = applicationListTarget("loan", {
      range: { from: "2026-09-01", to: "2026-09-30" },
      tab: "processed",
    });

    expect(target.to).toBe("/applications/deduction-application");
    expect(readApplicationDrill(target.search ?? {})).toEqual({
      dateRange: ["2026-09-01", "2026-09-30"],
      tab: "processed",
    });
    expect(readApplicationDrill({ tab: "all" })).toEqual({
      dateRange: null,
      tab: undefined,
    });
  });

  it("knows only the request kinds it has a list for", () => {
    expect(isApplicationKind("officialBusiness")).toBe(true);
    expect(isApplicationKind("toString")).toBe(false);
    expect(isApplicationKind("payrollPosting")).toBe(false);
  });
});

describe("payroll run drill", () => {
  it("maps a run type to its batch list", () => {
    expect(payrollRunTarget("ThirteenthMonth")?.to).toBe(
      "/daily-time-record/for-13th-month",
    );
    expect(payrollRunTarget("Unknown")).toBeNull();
    expect(payrollRunTarget(null)).toBeNull();
  });
});
