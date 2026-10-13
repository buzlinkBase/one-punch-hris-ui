import dayjs from "dayjs";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import {
  isActiveInRange,
  isPayrollOnlyThroughout,
} from "@/shared/utils/employee-active.util";
import type { PayrollReadinessEmployee } from "../../for-payroll/models/api/response/payroll-readiness.model";
import type { DtrEmployeeSummaryResponse } from "../models/api/response/dtr-employee-summary.model";

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

const daysInRange = (from: string, to: string) =>
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
  // The readiness endpoint also lists payroll-only (no DTR) employees so Payroll Run can pay them;
  // they have no DTR to generate, so they are not coverage rows.
  const rows: CoverageRow[] = coverage
    .filter((c) => !c.isPayrollOnly)
    .map((c) => ({
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
    if (
      withDtr.has(e.id) ||
      !isActiveInRange(e, from, to) ||
      isPayrollOnlyThroughout(e, from, to)
    )
      continue;
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

export type SaveState = "New" | "FillsMissing" | "AlreadySaved" | "Saving";

export const SAVE_STATE_LABEL: Record<SaveState, string> = {
  New: "To save",
  FillsMissing: "Fills missing days",
  AlreadySaved: "Already saved",
  // Save Draft was clicked and the server is still writing this employee's days.
  Saving: "Saving in background…",
};

export const SAVE_STATE_COLOR: Record<SaveState, string> = {
  New: "success",
  FillsMissing: "processing",
  AlreadySaved: "default",
  Saving: "processing",
};

// Only these can be ticked for Save Draft -- not what is already saved, and not what is already
// being saved (which is how a second click can't queue the same days twice).
export const isSavable = (s: { saveState: SaveState }) =>
  s.saveState === "New" || s.saveState === "FillsMissing";

export interface EmployeeDtrSummary {
  employeeId: string;
  fullName: string;
  // Days (yyyy-MM-dd) that already have a saved DTR -- Save Draft skips these, and the expanded
  // day rows show them as locked.
  savedDates: string[];
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

// Which of the given employees still have a generated day with no saved DTR -- what a background
// Save Draft has yet to write. Empty once the server has finished them all.
export function unsavedEmployeeIds(
  summaries: DtrEmployeeSummaryResponse[],
  coverage: PayrollReadinessEmployee[],
  ids: string[],
): string[] {
  const wanted = new Set(ids);
  const saved = new Map(
    coverage.map((c) => [c.employeeId, new Set((c.savedDates ?? []).map(day))]),
  );
  return summaries
    .filter((s) => wanted.has(s.employeeId))
    .filter((s) => {
      const done = saved.get(s.employeeId);
      return s.workDates.some((d) => !done?.has(day(d)));
    })
    .map((s) => s.employeeId);
}

export const hasIssues = (s: EmployeeDtrSummary) =>
  s.missingPunchDays > 0 || s.absences > 0;

// The server's per-employee summaries (dtr-summary), each set against the days that already have
// a saved DTR. The totals come straight from the server; only the save state is worked out here.
export function buildEmployeeSummaries(
  summaries: DtrEmployeeSummaryResponse[],
  savedDatesByEmployee: Map<string, string[]>,
): EmployeeDtrSummary[] {
  return summaries
    .map((s) => {
      const savedDates = (savedDatesByEmployee.get(s.employeeId) ?? []).map(
        day,
      );
      const saved = new Set(savedDates);
      const workDates = [...new Set(s.workDates.map(day))];
      const newDays = workDates.filter((d) => !saved.has(d)).length;
      const days = workDates.length;
      return {
        employeeId: s.employeeId,
        fullName: s.fullName ?? s.employeeId,
        savedDates,
        days,
        newDays,
        savedDays: days - newDays,
        regularHours: s.regularHours,
        otHours: s.otHours,
        ndHours: s.ndHours,
        lateMinutes: s.lateMinutes,
        utMinutes: s.utMinutes,
        absences: s.absences,
        leaveHours: s.leaveHours,
        missingPunchDays: s.missingPunchDays,
        saveState: (newDays === 0
          ? "AlreadySaved"
          : newDays < days
            ? "FillsMissing"
            : "New") as SaveState,
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}
