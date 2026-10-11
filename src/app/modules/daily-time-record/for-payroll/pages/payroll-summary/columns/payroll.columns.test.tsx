import { describe, expect, it } from "vitest";
import type { ColumnType, ColumnGroupType } from "antd/es/table";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import { payrollColumns, type ExpandableGroup } from "./payroll.columns";

type Col = ColumnType<PayrollRunResult> | ColumnGroupType<PayrollRunResult>;

const result = (over: Partial<PayrollRunResult>) =>
  ({
    otherDeductions: 0,
    totalLoans: 0,
    totalOtherIncome: 0,
    ...over,
  }) as PayrollRunResult;

const results = [
  result({
    otherDeductions: 580,
    totalLoans: 500,
    totalOtherIncome: 100,
    deductionItems: [
      { itemId: "sss", label: "SSS Loan", amount: 500, isLoan: true },
      { itemId: "dues", label: "Union Dues", amount: 80 },
    ],
    incomeItems: [{ itemId: "hg", label: "HG Allowance", amount: 100 }],
  }),
];

const build = (
  open: Partial<Record<ExpandableGroup, boolean>> = {},
  rows: PayrollRunResult[] = results,
) =>
  payrollColumns({
    onPrint: () => {},
    results: rows,
    expanded: {
      holiday: false,
      loans: false,
      otherDeductions: false,
      otherIncome: false,
      ...open,
    },
    onToggle: () => {},
  }) as Col[];

const group = (cols: Col[], key: string) =>
  cols.find((c) => c.key === key) as ColumnGroupType<PayrollRunResult>;

const keys = (cols: Col[]) => cols.map((c) => c.key);

describe("payrollColumns", () => {
  it("shows a single Holiday column when collapsed", () => {
    const earnings = group(build(), "earnings").children as Col[];
    expect(earnings.some((c) => c.key === "hol")).toBe(true);
    expect(earnings.some((c) => c.key === "holidayGroup")).toBe(false);
  });

  it("expands Holiday into 7 categories plus Total", () => {
    const earnings = group(build({ holiday: true }), "earnings")
      .children as Col[];
    const holiday = group(earnings, "holidayGroup");
    expect(holiday.children).toHaveLength(8);
    expect(holiday.children.at(-1)?.key).toBe("hol");
  });

  it("puts Earnings before Deductions and pins Employee left, Net Pay right", () => {
    const cols = build();
    const keys = cols.map((c) => c.key);
    expect(keys.indexOf("earnings")).toBeLessThan(keys.indexOf("deductions"));
    expect(cols[0]).toMatchObject({ key: "name", fixed: "left" });
    expect(cols.at(-2)).toMatchObject({ key: "net", fixed: "right" });
    expect(cols.at(-1)).toMatchObject({ key: "actions", fixed: "right" });
  });

  it("includes Cash Bond in the Deductions group", () => {
    const deductions = group(build(), "deductions").children as Col[];
    expect(deductions.map((c) => c.key)).toContain("cashBond");
  });

  it("keeps Loans, Other Deductions and Other Income as single total columns when collapsed", () => {
    const cols = build();
    const deductions = group(cols, "deductions").children as Col[];
    const earnings = group(cols, "earnings").children as Col[];
    expect(keys(deductions)).toEqual(
      expect.arrayContaining(["loans", "otherDed"]),
    );
    expect(keys(deductions).some((k) => `${k}`.endsWith("Group"))).toBe(false);
    expect(keys(earnings)).toContain("other");
  });

  it("unfolds Loans into its types plus Total, and leaves Other Deductions alone", () => {
    const deductions = group(build({ loans: true }), "deductions")
      .children as Col[];
    const loans = group(deductions, "loansGroup");
    expect(keys(loans.children as Col[])).toEqual(["loans:sss", "loans"]);
    expect(keys(deductions)).toContain("otherDed");
  });

  it("unfolds Other Deductions into its non-loan types plus Total", () => {
    const deductions = group(build({ otherDeductions: true }), "deductions")
      .children as Col[];
    const other = group(deductions, "otherDedGroup");
    expect(keys(other.children as Col[])).toEqual([
      "otherDed:dues",
      "otherDed",
    ]);
  });

  it("unfolds Other Income into its types plus Total", () => {
    const earnings = group(build({ otherIncome: true }), "earnings")
      .children as Col[];
    const income = group(earnings, "otherGroup");
    expect(keys(income.children as Col[])).toEqual(["other:hg", "other"]);
  });

  it("adds an Adjustments column only when a total exceeds its types", () => {
    const withAdjustment = [
      result({
        otherDeductions: 130,
        deductionItems: [{ itemId: "dues", label: "Union Dues", amount: 80 }],
      }),
    ];
    const deductions = group(
      build({ otherDeductions: true }, withAdjustment),
      "deductions",
    ).children as Col[];
    const other = group(deductions, "otherDedGroup");
    expect(keys(other.children as Col[])).toEqual([
      "otherDed:dues",
      "otherDed:adj",
      "otherDed",
    ]);
  });
});
