import { isValidElement } from "react";
import { describe, expect, it, vi } from "vitest";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import { otherDeductionsBreakdown } from "../utils/payroll-summary.util";
import { totalCell } from "./source-link";

const row = (over: Partial<PayrollRunResult> = {}) =>
  ({
    fullName: "Alcala, Jane",
    otherDeductions: 80,
    totalLoans: 0,
    savedSources: {
      otherDeductions: [
        { label: "Union Dues", amount: 80, note: "Scheduled Oct 16, 2026" },
      ],
    },
    ...over,
  }) as PayrollRunResult;

describe("totalCell", () => {
  it("is plain money without a popup handler", () => {
    expect(totalCell(row(), otherDeductionsBreakdown, "Other Deductions")).toBe(
      "80.00",
    );
  });

  it("is a link when the saved run carries the installments", () => {
    const cell = totalCell(
      row(),
      otherDeductionsBreakdown,
      "Other Deductions",
      vi.fn(),
    );
    expect(isValidElement(cell)).toBe(true);
  });

  it("is plain money when the run has no installment lines for it", () => {
    const cell = totalCell(
      row({ savedSources: undefined }),
      otherDeductionsBreakdown,
      "Other Deductions",
      vi.fn(),
    );
    expect(cell).toBe("80.00");
  });

  it("is plain money for a zero total", () => {
    const cell = totalCell(
      row({ otherDeductions: 0 }),
      otherDeductionsBreakdown,
      "Other Deductions",
      vi.fn(),
    );
    expect(cell).toBe("0.00");
  });
});
