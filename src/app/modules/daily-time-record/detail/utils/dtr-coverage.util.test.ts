import { describe, expect, it } from "vitest";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import type { PayrollReadinessEmployee } from "../../for-payroll/models/api/response/payroll-readiness.model";
import type { DtrDetailResponse } from "../models/api/response/dtr-detail-response.model";
import {
  buildCoverageRows,
  buildEmployeeSummaries,
  countByCoverage,
  coverageStatus,
  hasIssues,
} from "./dtr-coverage.util";

const FROM = "2026-01-01";
const TO = "2026-01-03";

const coverage = (
  over: Partial<PayrollReadinessEmployee>,
): PayrollReadinessEmployee => ({
  employeeId: "e1",
  fullName: "Cruz, Juan",
  salaryType: "VARIABLE",
  approvedDays: 0,
  pendingDays: 0,
  paidDays: 0,
  pendingBatchCodes: [],
  savedDates: [],
  status: "Ready",
  ...over,
});

const employee = (over: Partial<EmployeeResponse>) =>
  ({
    id: "e1",
    employeeNo: "001",
    firstName: "Juan",
    lastName: "Cruz",
    hireDate: "2025-01-01",
    employmentStatus: "Regular",
    dateResigned: null,
    ...over,
  }) as EmployeeResponse;

const dtr = (over: Partial<DtrDetailResponse>) =>
  ({
    employeeId: "e1",
    fullName: "Cruz, Juan",
    workDate: "2026-01-01",
    workType: "RegularWorkDay",
    startTime: "2026-01-01T08:00:00",
    endTime: "2026-01-01T17:00:00",
    regularNetHours: 8,
    regularOTHours: 0,
    restDayOTHours: 0,
    regularNDHours: 0,
    restDayNDHours: 0,
    lateMinutes: 0,
    utMinutes: 0,
    absentCount: 0,
    paidLeaveHours: 0,
    unpaidLeaveHours: 0,
    ...over,
  }) as DtrDetailResponse;

describe("coverageStatus", () => {
  it("is Partial when some days of the cutoff have no saved DTR", () => {
    expect(
      coverageStatus(coverage({ savedDates: ["2026-01-01"] }), FROM, TO),
    ).toBe("Partial");
  });

  it("is Draft when every day is saved but some await approval", () => {
    expect(
      coverageStatus(
        coverage({
          savedDates: ["2026-01-01", "2026-01-02", "2026-01-03"],
          pendingDays: 1,
        }),
        FROM,
        TO,
      ),
    ).toBe("Draft");
  });

  it("is Approved when every day is saved and nothing is pending", () => {
    expect(
      coverageStatus(
        coverage({
          savedDates: ["2026-01-01", "2026-01-02", "2026-01-03"],
          approvedDays: 3,
        }),
        FROM,
        TO,
      ),
    ).toBe("Approved");
  });
});

describe("buildCoverageRows", () => {
  it("adds NotGenerated rows for active employees with no saved DTR only", () => {
    const rows = buildCoverageRows(
      [coverage({ employeeId: "e1", savedDates: ["2026-01-01"] })],
      [
        employee({ id: "e1" }),
        employee({ id: "e2" }),
        employee({ id: "gone", dateResigned: "2025-12-01" }),
      ],
      FROM,
      TO,
    );
    expect(rows.map((r) => [r.employeeId, r.status])).toEqual([
      ["e1", "Partial"],
      ["e2", "NotGenerated"],
    ]);
    expect(countByCoverage(rows)).toMatchObject({
      Partial: 1,
      NotGenerated: 1,
      Approved: 0,
    });
  });
});

describe("buildEmployeeSummaries", () => {
  const records = [
    dtr({ workDate: "2026-01-01" }),
    dtr({ workDate: "2026-01-02", endTime: null }),
    dtr({ workDate: "2026-01-03", absentCount: 1, regularNetHours: 0 }),
    dtr({ employeeId: "e2", fullName: "Santos, Ana", workDate: "2026-01-01" }),
  ];

  it("splits each employee's rows into new and already-saved days", () => {
    const [cruz, santos] = buildEmployeeSummaries(
      records,
      new Map([
        ["e1", ["2026-01-01"]],
        ["e2", ["2026-01-01"]],
      ]),
    );
    expect(cruz.saveState).toBe("FillsMissing");
    expect(cruz.newRows.map((r) => r.workDate)).toEqual([
      "2026-01-02",
      "2026-01-03",
    ]);
    expect(cruz.savedDays).toBe(1);
    expect(santos.saveState).toBe("AlreadySaved");
    expect(santos.newRows).toEqual([]);
  });

  it("totals hours and flags missing punches and absences", () => {
    const [cruz] = buildEmployeeSummaries(records, new Map());
    expect(cruz.saveState).toBe("New");
    expect(cruz.days).toBe(3);
    expect(cruz.regularHours).toBe(16);
    expect(cruz.missingPunchDays).toBe(1);
    expect(cruz.absences).toBe(1);
    expect(hasIssues(cruz)).toBe(true);
  });
});
