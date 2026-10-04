import { describe, expect, it } from "vitest";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import type { PayrollReadinessEmployee } from "../models/api/response/payroll-readiness.model";
import {
  buildReadinessRows,
  countByStatus,
  isActiveInRange,
  isPayable,
} from "./payroll-readiness.util";

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

const readiness = (
  over: Partial<PayrollReadinessEmployee>,
): PayrollReadinessEmployee => ({
  employeeId: "e1",
  fullName: "Cruz, Juan",
  salaryType: "VARIABLE",
  approvedDays: 10,
  pendingDays: 0,
  paidDays: 0,
  pendingBatchCodes: [],
  status: "Ready",
  ...over,
});

describe("buildReadinessRows", () => {
  it("adds a NoDtr row for in-scope employees the server returned nothing for", () => {
    const rows = buildReadinessRows(
      [readiness({ employeeId: "e1" })],
      [employee({ id: "e1" }), employee({ id: "e2", lastName: "Santos" })],
      "2026-01-01",
      "2026-01-15",
    );
    expect(rows.map((r) => [r.employeeId, r.status])).toEqual([
      ["e1", "Ready"],
      ["e2", "NoDtr"],
    ]);
  });

  it("keeps server rows even when the employee list doesn't have them", () => {
    const rows = buildReadinessRows(
      [readiness({ employeeId: "e9", status: "Pending" })],
      [],
      "2026-01-01",
      "2026-01-15",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("Pending");
  });

  it("leaves out separated or not-yet-hired employees with no DTR", () => {
    const rows = buildReadinessRows(
      [],
      [
        employee({ id: "resigned", dateResigned: "2025-12-31" }),
        employee({ id: "future", hireDate: "2026-02-01" }),
        employee({ id: "terminated", employmentStatus: "Terminated" }),
      ],
      "2026-01-01",
      "2026-01-15",
    );
    expect(rows).toEqual([]);
  });
});

describe("isActiveInRange", () => {
  it("counts someone who resigned mid-cutoff as active", () => {
    expect(
      isActiveInRange(
        employee({ dateResigned: "2026-01-10", employmentStatus: "Resigned" }),
        "2026-01-01",
        "2026-01-15",
      ),
    ).toBe(true);
  });
});

describe("countByStatus / isPayable", () => {
  it("counts every status, including zeroes", () => {
    const counts = countByStatus([
      { status: "Ready" },
      { status: "Ready" },
      { status: "NoDtr" },
    ]);
    expect(counts.Ready).toBe(2);
    expect(counts.NoDtr).toBe(1);
    expect(counts.Pending).toBe(0);
  });

  it("only Ready and Partial are payable", () => {
    expect(isPayable("Ready")).toBe(true);
    expect(isPayable("Partial")).toBe(true);
    expect(isPayable("Pending")).toBe(false);
    expect(isPayable("Paid")).toBe(false);
    expect(isPayable("NoDtr")).toBe(false);
  });
});
