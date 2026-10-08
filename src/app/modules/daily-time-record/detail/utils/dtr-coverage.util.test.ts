import { describe, expect, it } from "vitest";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import type { PayrollReadinessEmployee } from "../../for-payroll/models/api/response/payroll-readiness.model";
import type { DtrEmployeeSummaryResponse } from "../models/api/response/dtr-employee-summary.model";
import {
  buildCoverageRows,
  buildEmployeeSummaries,
  countByCoverage,
  coverageStatus,
  hasIssues,
  isSavable,
  unsavedEmployeeIds,
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

const summary = (
  over: Partial<DtrEmployeeSummaryResponse>,
): DtrEmployeeSummaryResponse => ({
  employeeId: "e1",
  fullName: "Cruz, Juan",
  workDates: ["2026-01-01", "2026-01-02", "2026-01-03"],
  regularHours: 16,
  otHours: 0,
  ndHours: 0,
  lateMinutes: 0,
  utMinutes: 0,
  absences: 1,
  leaveHours: 0,
  missingPunchDays: 1,
  ...over,
});

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
  const summaries = [
    summary({}),
    summary({
      employeeId: "e2",
      fullName: "Santos, Ana",
      workDates: ["2026-01-01"],
      regularHours: 8,
      absences: 0,
      missingPunchDays: 0,
    }),
  ];

  it("sets each employee's days against the already-saved ones", () => {
    const [cruz, santos] = buildEmployeeSummaries(
      summaries,
      new Map([
        ["e1", ["2026-01-01"]],
        ["e2", ["2026-01-01"]],
      ]),
    );
    expect(cruz.saveState).toBe("FillsMissing");
    expect(cruz.newDays).toBe(2);
    expect(cruz.savedDays).toBe(1);
    expect(cruz.savedDates).toEqual(["2026-01-01"]);
    expect(santos.saveState).toBe("AlreadySaved");
    expect(santos.newDays).toBe(0);
  });

  it("keeps the server's totals and flags missing punches and absences", () => {
    const [cruz] = buildEmployeeSummaries(summaries, new Map());
    expect(cruz.saveState).toBe("New");
    expect(cruz.days).toBe(3);
    expect(cruz.regularHours).toBe(16);
    expect(cruz.missingPunchDays).toBe(1);
    expect(cruz.absences).toBe(1);
    expect(hasIssues(cruz)).toBe(true);
  });

  it("matches saved dates sent with a time part and sorts by name", () => {
    const [abad, zamora] = buildEmployeeSummaries(
      [
        summary({ fullName: "Zamora, Zed" }),
        summary({ employeeId: "e2", fullName: "Abad, Al" }),
      ],
      new Map([["e1", ["2026-01-02T00:00:00"]]]),
    );
    expect(abad.fullName).toBe("Abad, Al");
    expect(zamora.savedDates).toEqual(["2026-01-02"]);
    expect(zamora.newDays).toBe(2);
  });
});

describe("unsavedEmployeeIds", () => {
  const summaries = [
    summary({}),
    summary({ employeeId: "e2", workDates: ["2026-01-01", "2026-01-02"] }),
    summary({ employeeId: "e3", workDates: ["2026-01-01"] }),
  ];

  it("lists queued employees that still have a generated day with no saved DTR", () => {
    const left = unsavedEmployeeIds(
      summaries,
      [
        coverage({
          employeeId: "e1",
          savedDates: ["2026-01-01", "2026-01-02", "2026-01-03"],
        }),
        coverage({ employeeId: "e2", savedDates: ["2026-01-01"] }),
      ],
      ["e1", "e2", "e3"],
    );

    expect(left).toEqual(["e2", "e3"]);
  });

  it("is empty once the server has written every queued day", () => {
    expect(
      unsavedEmployeeIds(
        summaries,
        [
          coverage({
            employeeId: "e1",
            savedDates: ["2026-01-01T00:00:00", "2026-01-02", "2026-01-03"],
          }),
        ],
        ["e1"],
      ),
    ).toEqual([]);
  });

  it("ignores employees that weren't queued", () => {
    expect(unsavedEmployeeIds(summaries, [], ["e3"])).toEqual(["e3"]);
  });
});

describe("isSavable", () => {
  it("only lets what is neither saved nor being saved be ticked", () => {
    expect(isSavable({ saveState: "New" })).toBe(true);
    expect(isSavable({ saveState: "FillsMissing" })).toBe(true);
    expect(isSavable({ saveState: "AlreadySaved" })).toBe(false);
    expect(isSavable({ saveState: "Saving" })).toBe(false);
  });
});
