import { describe, expect, it } from "vitest";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import {
  DEDUCTIONS_HEADERS,
  EARNINGS_HEADERS,
  ER_HEADERS,
  EXPORT_HEADERS,
  HOLIDAY_HEADERS,
  HOURS_HEADERS,
  buildDeductionsRows,
  buildEarningsRows,
  buildErRows,
  buildExportRows,
  buildHolidayRows,
  buildHoursRows,
} from "./payroll-summary-export.util";

const row = {
  id: "p1",
  fullName: "Juan Dela Cruz",
  salaryType: "VARIABLE",
  dailyRate: 610,
  payPeriodStart: "2026-09-01",
  payPeriodEnd: "2026-09-15",
  basicPay: 1234.567,
  grossIncome: 15000.5,
  sssContribution: 581.3,
  cashBondDeduction: 200,
  otherDeductions: 800,
  totalLoans: 500,
  lateAmount: 40,
  underTimeAmount: 15,
  absencesAmount: 610,
  netPay: 12000,
  regularNetHours: 62 / 60,
} as unknown as PayrollRunResult;

const sheets = [
  ["CSV", EXPORT_HEADERS, buildExportRows],
  ["Earnings", EARNINGS_HEADERS, buildEarningsRows],
  ["Holiday", HOLIDAY_HEADERS, buildHolidayRows],
  ["Deductions", DEDUCTIONS_HEADERS, buildDeductionsRows],
  ["ER", ER_HEADERS, buildErRows],
  ["Hours", HOURS_HEADERS, buildHoursRows],
] as const;

describe("payroll summary export rows", () => {
  it.each(sheets)("%s has one value per header", (_, headers, build) => {
    expect(build([row])[0]).toHaveLength(headers.length);
  });

  it.each(sheets)(
    "%s writes amounts as numbers, not formatted text",
    (_, headers, build) => {
      const cells = build([row])[0];
      expect(cells[0]).toBe("Juan Dela Cruz");
      // Every cell except the text columns is a number.
      const textHeaders = new Set([
        "Employee",
        "Status",
        "Salary Type",
        "Period Start",
        "Period End",
      ]);
      cells.forEach((cell, i) => {
        if (!textHeaders.has(headers[i])) expect(typeof cell).toBe("number");
      });
    },
  );

  it("rounds to 2 decimals and keeps the derived figures", () => {
    const deductions = buildDeductionsRows([row])[0];
    const col = (h: string) => deductions[DEDUCTIONS_HEADERS.indexOf(h)];
    expect(col("Cash Bond")).toBe(200);
    expect(col("Other Deductions")).toBe(300);
    expect(col("Late/UT")).toBe(55);
    expect(col("Absent")).toBe(610);

    const earnings = buildEarningsRows([row])[0];
    expect(earnings[EARNINGS_HEADERS.indexOf("Basic")]).toBe(1234.57);
    expect(buildHoursRows([row])[0][HOURS_HEADERS.indexOf("Regular")]).toBe(
      1.03,
    );
  });
});
