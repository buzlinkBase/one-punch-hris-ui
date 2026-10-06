import { describe, expect, it } from "vitest";
import type { PayrollBatchListModel } from "../../../models/api/response/payroll-batch-list.model";
import {
  buildPayrollBatchOption,
  buildPayrollBatchOptions,
} from "./payroll-batch-option.util";

const batch = (
  over: Partial<PayrollBatchListModel> = {},
): PayrollBatchListModel => ({
  id: "11111111-1111-1111-1111-111111111aaaa",
  payPeriodStart: "2026-10-01",
  payPeriodEnd: "2026-10-15",
  payDate: null,
  remarks: null,
  employeeCount: 25,
  isPosted: false,
  approvalStatus: "ForApproval",
  generatedByEmployeeId: "emp-1",
  payrollType: "Regular",
  pendingDeletion: false,
  ...over,
});

describe("buildPayrollBatchOption", () => {
  it("shows period, run type, status and employee count", () => {
    const o = buildPayrollBatchOption(batch());
    expect(o.label).toBe(
      "Oct 1 – Oct 15, 2026 · Regular · For Approval · 25 employees",
    );
    expect(o.remarks).toBeNull();
  });

  it("leads with the saved remarks", () => {
    const o = buildPayrollBatchOption(batch({ remarks: "  Client A only " }));
    expect(o.remarks).toBe("Client A only");
    expect(o.label.startsWith("Client A only — Oct 1")).toBe(true);
  });

  it("adds the payout date and who generated it when known", () => {
    const o = buildPayrollBatchOption(batch({ payDate: "2026-10-16" }), "Ana");
    expect(o.detail).toContain("Payout Oct 16");
    expect(o.detail).toContain("by Ana");
  });

  it("uses the singular for one employee and flags a pending deletion", () => {
    const o = buildPayrollBatchOption(
      batch({ employeeCount: 1, pendingDeletion: true }),
    );
    expect(o.detail).toContain("1 employee");
    expect(o.detail).not.toContain("1 employees");
    expect(o.detail).toContain("Pending Deletion");
  });
});

describe("buildPayrollBatchOptions", () => {
  it("tells two same-period runs apart by their remarks", () => {
    const options = buildPayrollBatchOptions([
      batch({ id: "a", remarks: "First run" }),
      batch({ id: "b", remarks: "Re-run after DTR fix" }),
    ]);
    expect(new Set(options.map((o) => o.label)).size).toBe(2);
  });

  it("appends a short id only when two runs are otherwise identical", () => {
    const options = buildPayrollBatchOptions([
      batch({ id: "aaaa-1111" }),
      batch({ id: "bbbb-2222" }),
      batch({ id: "cccc-3333", employeeCount: 3 }),
    ]);
    expect(options[0].label.endsWith("#1111")).toBe(true);
    expect(options[1].label.endsWith("#2222")).toBe(true);
    expect(options[2].label).not.toContain("#");
  });

  it("resolves the generating employee's name through the lookup", () => {
    const options = buildPayrollBatchOptions([batch()], (id) =>
      id === "emp-1" ? "Ana Cruz" : undefined,
    );
    expect(options[0].detail).toContain("by Ana Cruz");
  });
});
