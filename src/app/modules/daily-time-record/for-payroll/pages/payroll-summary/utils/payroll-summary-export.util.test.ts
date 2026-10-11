import { describe, expect, it } from "vitest";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import {
  ER_HEADERS,
  EXPORT_HEADERS,
  HOURS_HEADERS,
  PAYROLL_HEADERS,
  buildErRows,
  buildExportRows,
  buildHoursRows,
  buildExportSheet,
  buildPayrollRows,
  buildPayrollSheet,
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
  ["Payroll", PAYROLL_HEADERS, buildPayrollRows],
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

  describe("expanded Loans / Other Deductions / Other Income columns", () => {
    const withItems = {
      ...row,
      totalOtherIncome: 150,
      deductionItems: [
        { itemId: "sss", label: "SSS Loan", amount: 500, isLoan: true },
        { itemId: "dues", label: "Union Dues", amount: 250 },
      ],
      incomeItems: [{ itemId: "hg", label: "HG Allowance", amount: 100 }],
    } as PayrollRunResult;
    const other = {
      ...row,
      fullName: "Ana Reyes",
      totalLoans: 0,
      otherDeductions: 40,
      totalOtherIncome: 0,
      deductionItems: [{ itemId: "med", label: "Medical", amount: 40 }],
    } as PayrollRunResult;

    it.each([
      ["CSV", buildExportSheet],
      ["Payroll", buildPayrollSheet],
    ] as const)(
      "%s places each type just before its group total",
      (_, build) => {
        const { headers } = build([withItems, other]);
        expect(headers.indexOf("SSS Loan")).toBe(headers.indexOf("Loans") - 1);
        // Union across employees, A-Z, then the (single) Adjustments column the totals need.
        const otherDed = headers.indexOf("Other Deductions");
        expect(headers.slice(otherDed - 3, otherDed)).toEqual([
          "Medical",
          "Union Dues",
          "Other Deductions Adj.",
        ]);
        // 150 Other Income vs 100 itemized -> a 50 remainder; the second employee has none.
        expect(
          headers.slice(headers.indexOf("HG Allowance")).slice(0, 3),
        ).toEqual(["HG Allowance", "Other Income Adj.", "Other Income"]);
      },
    );

    it.each([
      ["CSV", buildExportSheet],
      ["Payroll", buildPayrollSheet],
    ] as const)(
      "%s keeps rows aligned with headers and amounts per employee",
      (_, build) => {
        const { headers, rows } = build([withItems, other]);
        rows.forEach((r) => expect(r).toHaveLength(headers.length));
        const at = (r: (string | number)[], h: string) => r[headers.indexOf(h)];
        expect(at(rows[0], "SSS Loan")).toBe(500);
        expect(at(rows[0], "Union Dues")).toBe(250);
        expect(at(rows[0], "Medical")).toBe(0);
        expect(at(rows[0], "Other Income Adj.")).toBe(50);
        expect(at(rows[1], "Medical")).toBe(40);
        expect(at(rows[1], "SSS Loan")).toBe(0);
        expect(at(rows[1], "Other Deductions Adj.")).toBe(0);
      },
    );

    it("adds no columns when no row has items and the totals are plain", () => {
      const plain = { ...row, totalLoans: 0, otherDeductions: 0 };
      expect(buildPayrollSheet([plain]).headers).toEqual(PAYROLL_HEADERS);
    });

    it("turns a total with no items into an Adjustments column", () => {
      const { headers, rows } = buildPayrollSheet([row]);
      // row: 500 loans, 300 other deductions, neither itemized.
      expect(headers).toContain("Loans Adj.");
      expect(rows[0][headers.indexOf("Loans Adj.")]).toBe(500);
      expect(rows[0][headers.indexOf("Other Deductions Adj.")]).toBe(300);
    });
  });

  it("rounds to 2 decimals and keeps the derived figures", () => {
    const payroll = buildPayrollRows([row])[0];
    const col = (h: string) => payroll[PAYROLL_HEADERS.indexOf(h)];
    expect(col("Cash Bond")).toBe(200);
    expect(col("Other Deductions")).toBe(300);
    expect(col("Late/UT")).toBe(55);
    expect(col("Absent")).toBe(610);

    expect(col("Basic")).toBe(1234.57);
    expect(col("Net Pay")).toBe(12000);
    expect(buildHoursRows([row])[0][HOURS_HEADERS.indexOf("Regular")]).toBe(
      1.03,
    );
  });
});
