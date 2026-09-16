import { describe, it, expect } from "vitest";
import { generateLoanBreakdown } from "./loan-amortization.util";

describe("generateLoanBreakdown", () => {
  it("returns an empty schedule when required inputs are missing", () => {
    const noPrincipal = generateLoanBreakdown(
      0,
      12,
      6,
      "2026-01-01",
      "Monthly",
    );
    const noTerms = generateLoanBreakdown(
      10000,
      12,
      0,
      "2026-01-01",
      "Monthly",
    );
    const noStartDate = generateLoanBreakdown(10000, 12, 6, "", "Monthly");

    expect(noPrincipal).toEqual([]);
    expect(noTerms).toEqual([]);
    expect(noStartDate).toEqual([]);
  });

  it("splits the principal evenly across terms when the interest rate is zero", () => {
    const rows = generateLoanBreakdown(12000, 0, 12, "2026-01-01", "Monthly");

    expect(rows).toHaveLength(12);
    expect(rows[0].interest).toBe(0);
    expect(rows[0].amount).toBeCloseTo(1000, 4);
    // Balance strictly decreases and lands on exactly zero after the last term.
    expect(rows.at(-1)!.balance).toBe(0);
  });

  it("amortizes a fixed-rate loan down to a zero balance", () => {
    const rows = generateLoanBreakdown(50000, 12, 24, "2026-01-15", "Monthly");

    expect(rows).toHaveLength(24);
    // Every row's payment should be the same level amount (standard amortization).
    const payments = new Set(rows.map((r) => r.amount));
    expect(payments.size).toBe(1);
    // Interest portion shrinks and principal portion grows as the balance is paid down.
    expect(rows[0].interest).toBeGreaterThan(rows.at(-1)!.interest);
    expect(rows[0].principal).toBeLessThan(rows.at(-1)!.principal);
    expect(rows.at(-1)!.balance).toBe(0);
  });

  it("never lets the running balance go negative", () => {
    const rows = generateLoanBreakdown(1000, 24, 6, "2026-01-01", "Weekly");

    for (const row of rows) {
      expect(row.balance).toBeGreaterThanOrEqual(0);
    }
  });

  it("steps semi-monthly dates between the 15th and month-end", () => {
    const rows = generateLoanBreakdown(
      6000,
      12,
      4,
      "2026-01-01",
      "SemiMonthly",
    );

    expect(rows.map((r) => r.date)).toEqual([
      "2026-01-01",
      "2026-01-31",
      "2026-02-15",
      "2026-02-28",
    ]);
  });
});
