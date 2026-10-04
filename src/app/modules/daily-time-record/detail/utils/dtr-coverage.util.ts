import dayjs from "dayjs";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import { isActiveInRange } from "@/shared/utils/employee-active.util";
import type { PayrollReadinessEmployee } from "../../for-payroll/models/api/response/payroll-readiness.model";
import type { DtrDetailResponse } from "../models/api/response/dtr-detail-response.model";

// ── Coverage: how much of the cutoff already has saved DTR, per employee ─────────────────────

export type CoverageStatus = "NotGenerated" | "Partial" | "Draft" | "Approved";

export const COVERAGE_STATUS_ORDER: CoverageStatus[] = [
  "NotGenerated",
  "Partial",
  "Draft",
  "Approved",
];

export const COVERAGE_STATUS_LABEL: Record<CoverageStatus, string> = {
  NotGenerated: "No DTR yet",
  Partial: "Partly saved",
  Draft: "Awaiting approval",
  Approved: "Approved",
};

export const COVERAGE_STATUS_COLOR: Record<CoverageStatus, string> = {
  NotGenerated: "error",
  Partial: "warning",
  Draft: "processing",
  Approved: "success",
};

export const COVERAGE_STATUS_HINT: Record<CoverageStatus, string> = {
  NotGenerated: "No DTR has been saved for this employee in the cutoff yet.",
  Partial:
    "Some days of the cutoff have saved DTR, others don't. Generating again saves only the missing days.",
  Draft:
    "Every day is saved, but some are still in a draft awaiting approval on the Saved DTR tab.",
  Approved: "Every day of the cutoff is saved and approved.",
};

export interface CoverageRow {
  employeeId: string;
  employeeNo?: string | null;
  fullName?: string | null;
  payrollGroupId?: string | null;
  clientId?: string | null;
  departmentId?: string | null;
  savedDates: string[];
  status: CoverageStatus;
}

const day = (d: string) => d.slice(0, 10);

export const daysInRange = (from: string, to: string) =>
  dayjs(to).diff(dayjs(from), "day") + 1;

export function coverageStatus(
  r: Pick<PayrollReadinessEmployee, "pendingDays"> & { savedDates?: string[] },
  from: string,
  to: string,
): CoverageStatus {
  const saved = new Set((r.savedDates ?? []).map(day)).size;
  if (saved === 0) return "NotGenerated";
  if (saved < daysInRange(from, to)) return "Partial";
  return r.pendingDays > 0 ? "Draft" : "Approved";
}

// One row per employee in scope: the server's rows (anyone with any saved DTR in the cutoff) plus
// a NotGenerated row for each active employee it returned nothing for. Both lists are expected to
// be narrowed to the same scope (group, branch, client...) by the caller already.
export function buildCoverageRows(
  coverage: PayrollReadinessEmployee[],
  employees: EmployeeResponse[],
  from: string,
  to: string,
): CoverageRow[] {
  const withDtr = new Set(coverage.map((c) => c.employeeId));
  const rows: CoverageRow[] = coverage.map((c) => ({
    employeeId: c.employeeId,
    employeeNo: c.employeeNo,
    fullName: c.fullName,
    payrollGroupId: c.payrollGroupId,
    clientId: c.clientId,
    departmentId: c.departmentId,
    savedDates: (c.savedDates ?? []).map(day),
    status: coverageStatus(c, from, to),
  }));
  for (const e of employees) {
    if (withDtr.has(e.id) || !isActiveInRange(e, from, to)) continue;
    rows.push({
      employeeId: e.id,
      employeeNo: e.employeeNo,
      fullName: `${e.lastName}, ${e.firstName}`,
      payrollGroupId: e.payrollGroupId,
      clientId: e.clientId,
      departmentId: e.departmentId,
      savedDates: [],
      status: "NotGenerated",
    });
  }
  return rows;
}

export function countByCoverage(rows: { status: CoverageStatus }[]) {
  const counts = Object.fromEntries(
    COVERAGE_STATUS_ORDER.map((s) => [s, 0]),
  ) as Record<CoverageStatus, number>;
  for (const r of rows) counts[r.status] += 1;
  return counts;
}

// ── Review: the freshly generated DTR, one summary per employee ───────────────────────────────

export type SaveState = "New" | "FillsMissing" | "AlreadySaved";

export const SAVE_STATE_LABEL: Record<SaveState, string> = {
  New: "To save",
  FillsMissing: "Fills missing days",
  AlreadySaved: "Already saved",
};

export const SAVE_STATE_COLOR: Record<SaveState, string> = {
  New: "success",
  FillsMissing: "processing",
  AlreadySaved: "default",
};

export interface EmployeeDtrSummary {
  employeeId: string;
  fullName: string;
  rows: DtrDetailResponse[];
  // The rows whose date has no saved DTR yet -- the only ones Save Draft sends.
  newRows: DtrDetailResponse[];
  days: number;
  newDays: number;
  savedDays: number;
  regularHours: number;
  otHours: number;
  ndHours: number;
  lateMinutes: number;
  utMinutes: number;
  absences: number;
  leaveHours: number;
  // Days with a time-in but no time-out, or the other way round.
  missingPunchDays: number;
  saveState: SaveState;
}

const sum = (
  rows: DtrDetailResponse[],
  pick: (r: DtrDetailResponse) => number,
) => rows.reduce((s, r) => s + (pick(r) ?? 0), 0);

export const isMissingPunch = (r: DtrDetailResponse) =>
  !!r.startTime !== !!r.endTime;

export const hasIssues = (s: EmployeeDtrSummary) =>
  s.missingPunchDays > 0 || s.absences > 0;

export function buildEmployeeSummaries(
  records: DtrDetailResponse[],
  savedDatesByEmployee: Map<string, string[]>,
): EmployeeDtrSummary[] {
  const byEmployee = new Map<string, DtrDetailResponse[]>();
  for (const r of records) {
    const list = byEmployee.get(r.employeeId) ?? [];
    list.push(r);
    byEmployee.set(r.employeeId, list);
  }

  return [...byEmployee.entries()]
    .map(([employeeId, rows]) => {
      const saved = new Set(savedDatesByEmployee.get(employeeId) ?? []);
      const newRows = rows.filter((r) => !saved.has(day(r.workDate)));
      const distinct = (list: DtrDetailResponse[]) =>
        new Set(list.map((r) => day(r.workDate))).size;
      const days = distinct(rows);
      const newDays = distinct(newRows);
      const missingPunchDays = new Set(
        rows.filter(isMissingPunch).map((r) => day(r.workDate)),
      ).size;
      return {
        employeeId,
        fullName: rows.find((r) => r.fullName)?.fullName ?? employeeId,
        rows,
        newRows,
        days,
        newDays,
        savedDays: days - newDays,
        regularHours: sum(rows, (r) => r.regularNetHours),
        otHours: sum(rows, (r) => r.regularOTHours + r.restDayOTHours),
        ndHours: sum(rows, (r) => r.regularNDHours + r.restDayNDHours),
        lateMinutes: sum(rows, (r) => r.lateMinutes),
        utMinutes: sum(rows, (r) => r.utMinutes),
        absences: sum(rows, (r) => r.absentCount),
        leaveHours: sum(rows, (r) => r.paidLeaveHours + r.unpaidLeaveHours),
        missingPunchDays,
        saveState: (newDays === 0
          ? "AlreadySaved"
          : newDays < days
            ? "FillsMissing"
            : "New") as SaveState,
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}
