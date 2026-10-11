import { describe, expect, it } from "vitest";
import type { ColumnType, ColumnGroupType } from "antd/es/table";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import { payrollColumns } from "./payroll.columns";

type Col = ColumnType<PayrollRunResult> | ColumnGroupType<PayrollRunResult>;

const build = (holidayExpanded: boolean) =>
  payrollColumns({
    onPrint: () => {},
    holidayExpanded,
    onToggleHoliday: () => {},
  }) as Col[];

const group = (cols: Col[], key: string) =>
  cols.find((c) => c.key === key) as ColumnGroupType<PayrollRunResult>;

describe("payrollColumns", () => {
  it("shows a single Holiday column when collapsed", () => {
    const earnings = group(build(false), "earnings").children as Col[];
    expect(earnings.some((c) => c.key === "hol")).toBe(true);
    expect(earnings.some((c) => c.key === "holidayGroup")).toBe(false);
  });

  it("expands Holiday into 7 categories plus Total", () => {
    const earnings = group(build(true), "earnings").children as Col[];
    const holiday = group(earnings, "holidayGroup");
    expect(holiday.children).toHaveLength(8);
    expect(holiday.children.at(-1)?.key).toBe("hol");
  });

  it("puts Earnings before Deductions and pins Employee left, Net Pay right", () => {
    const cols = build(false);
    const keys = cols.map((c) => c.key);
    expect(keys.indexOf("earnings")).toBeLessThan(keys.indexOf("deductions"));
    expect(cols[0]).toMatchObject({ key: "name", fixed: "left" });
    expect(cols.at(-2)).toMatchObject({ key: "net", fixed: "right" });
    expect(cols.at(-1)).toMatchObject({ key: "actions", fixed: "right" });
  });

  it("includes Cash Bond in the Deductions group", () => {
    const deductions = group(build(false), "deductions").children as Col[];
    expect(deductions.map((c) => c.key)).toContain("cashBond");
  });
});
