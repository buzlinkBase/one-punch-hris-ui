import { describe, expect, it } from "vitest";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import {
  breakdownAmount,
  breakdownRemainder,
  breakdownTypes,
  hasBreakdownRemainder,
  loansBreakdown,
  otherDeductionsBreakdown,
  otherIncomeBreakdown,
} from "./payroll-summary.util";

const row = (over: Partial<PayrollRunResult>) =>
  ({
    otherDeductions: 0,
    totalLoans: 0,
    totalOtherIncome: 0,
    ...over,
  }) as PayrollRunResult;

const ana = row({
  totalLoans: 500,
  otherDeductions: 580,
  deductionItems: [
    { itemId: "sss", label: "SSS Loan", amount: 300, isLoan: true },
    { itemId: "sss", label: "SSS Loan", amount: 200, isLoan: true },
    { itemId: "dues", label: "Union Dues", amount: 80 },
  ],
});
const ben = row({
  otherDeductions: 40,
  deductionItems: [{ itemId: "med", label: "Medical", amount: 40 }],
});

describe("breakdown helpers", () => {
  it("splits one deduction list into loans and other deductions", () => {
    expect(breakdownTypes([ana], loansBreakdown)).toEqual([
      { itemId: "sss", label: "SSS Loan" },
    ]);
    expect(breakdownTypes([ana], otherDeductionsBreakdown)).toEqual([
      { itemId: "dues", label: "Union Dues" },
    ]);
  });

  it("lists each type once across employees, A-Z", () => {
    expect(
      breakdownTypes([ana, ben], otherDeductionsBreakdown).map((t) => t.label),
    ).toEqual(["Medical", "Union Dues"]);
  });

  it("returns no types for rows without items", () => {
    expect(breakdownTypes([row({})], otherIncomeBreakdown)).toEqual([]);
  });

  it("sums a row's amount per type, and 0 for a type it never paid", () => {
    expect(breakdownAmount(ana, loansBreakdown, "sss")).toBe(500);
    expect(breakdownAmount(ben, loansBreakdown, "sss")).toBe(0);
  });

  it("reports what a total holds beyond its types", () => {
    expect(breakdownRemainder(ana, loansBreakdown)).toBe(0);
    expect(breakdownRemainder(ana, otherDeductionsBreakdown)).toBe(0);
    const adjusted = row({
      otherDeductions: 130,
      deductionItems: ben.deductionItems,
    });
    expect(breakdownRemainder(adjusted, otherDeductionsBreakdown)).toBe(90);
  });

  it("flags a remainder only when some row has one", () => {
    expect(hasBreakdownRemainder([ana, ben], otherDeductionsBreakdown)).toBe(
      false,
    );
    expect(
      hasBreakdownRemainder(
        [ana, row({ otherDeductions: 10 })],
        otherDeductionsBreakdown,
      ),
    ).toBe(true);
  });
});
