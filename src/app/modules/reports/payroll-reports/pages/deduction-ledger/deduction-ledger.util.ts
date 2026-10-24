import type { DeductionLedgerResponse } from "../../models/api/response/payroll-reports.model";

export interface DeductionLedgerLine extends DeductionLedgerResponse {
  key: string;
  /** Cumulative outstanding across the employee's deductions, in display order. */
  runningBalance: number;
}

export interface DeductionLedgerGroup {
  key: string;
  employeeNo: string;
  fullName: string;
  total: number;
  startDate: string;
  endDate: string;
  children: DeductionLedgerLine[];
}

const byBalanceThenName = (
  a: DeductionLedgerResponse,
  b: DeductionLedgerResponse,
) =>
  b.currentBalance - a.currentBalance ||
  a.deductionName.localeCompare(b.deductionName);

/**
 * One group per employee, most owed first; inside a group the largest deduction first, each
 * carrying the running balance so the last line equals the group total.
 */
export function buildDeductionGroups(
  rows: DeductionLedgerResponse[],
): DeductionLedgerGroup[] {
  const byEmployee = new Map<string, DeductionLedgerResponse[]>();
  for (const r of rows) {
    const list = byEmployee.get(r.employeeId) ?? [];
    list.push(r);
    byEmployee.set(r.employeeId, list);
  }

  return [...byEmployee.entries()]
    .map(([employeeId, list]) => {
      let running = 0;
      const children = [...list].sort(byBalanceThenName).map((r, i) => {
        running += r.currentBalance;
        return {
          ...r,
          key: `${employeeId}-${r.deductionId}-${i}`,
          runningBalance: running,
        };
      });
      const starts = list
        .map((r) => r.startDate)
        .filter(Boolean)
        .sort();
      const ends = list
        .map((r) => r.endDate)
        .filter(Boolean)
        .sort();
      return {
        key: employeeId,
        employeeNo: list[0].employeeNo,
        fullName: list[0].fullName,
        total: running,
        startDate: starts[0] ?? "",
        endDate: ends[ends.length - 1] ?? "",
        children,
      };
    })
    .sort((a, b) => b.total - a.total || a.fullName.localeCompare(b.fullName));
}

export const flattenDeductionGroups = (
  groups: DeductionLedgerGroup[],
): DeductionLedgerLine[] => groups.flatMap((g) => g.children);
