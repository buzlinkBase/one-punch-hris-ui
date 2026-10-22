import type { ApprovalTab } from "@/shared/hooks/use-approval-tabs";
import type { DrillTarget } from "./drill-target";
import {
  asDateRange,
  asString,
  asStringArray,
  isIsoDate,
  type DateRange,
} from "./drill-search.util";

// The screens a figure can drill into, each with the filters it opens with. A builder here and
// the screen's reader below share one set of search params, so the two can't drift apart.

/** Drops empty filters, so the URL only carries what's set. */
function compact(search: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(search).filter(
      ([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0),
    ),
  );
}

// ── Setup > Employees ────────────────────────────────────────────────────────

/**
 * The employee list's own column filters (EmployeeListQuery) a drill can set, plus a marker: the
 * list remembers its last filters, so even a drill with none (every employee) must clear them.
 */
export const EMPLOYEE_DRILL_KEYS = [
  "drill",
  "departmentIds",
  "branchIds",
  "areaIds",
  "payrollGroupIds",
  "employmentStatuses",
  "genders",
  "statuses",
  "hireDateFrom",
  "hireDateTo",
] as const;

export interface EmployeeDrillFilter {
  departmentIds?: string[];
  branchIds?: string[];
  areaIds?: string[];
  payrollGroupIds?: string[];
  employmentStatuses?: string[];
  genders?: string[];
  statuses?: string[];
  hireDateFrom?: string;
  hireDateTo?: string;
}

const ARRAY_KEYS = [
  "departmentIds",
  "branchIds",
  "areaIds",
  "payrollGroupIds",
  "employmentStatuses",
  "genders",
  "statuses",
] as const;

/**
 * Headcount figures count people still employed. The employee list can't filter by separation
 * date, so its Active status is the closest match.
 */
export const CURRENT_STAFF: EmployeeDrillFilter = { statuses: ["Active"] };

export function employeeListTarget(filter: EmployeeDrillFilter): DrillTarget {
  return { to: "/setup/employee", search: compact({ drill: 1, ...filter }) };
}

/** The filters the employee list was drilled into with (maybe none), or null when it wasn't drilled into. */
export function readEmployeeDrill(
  seed: Partial<Record<(typeof EMPLOYEE_DRILL_KEYS)[number], unknown>>,
): EmployeeDrillFilter | null {
  if (seed.drill === undefined) return null;
  const filter: EmployeeDrillFilter = {};
  for (const key of ARRAY_KEYS) {
    const values = asStringArray(seed[key]);
    if (values) filter[key] = values;
  }
  if (isIsoDate(seed.hireDateFrom)) filter.hireDateFrom = seed.hireDateFrom;
  if (isIsoDate(seed.hireDateTo)) filter.hireDateTo = seed.hireDateTo;
  return filter;
}

// ── Daily Time Record (detail) ───────────────────────────────────────────────

export const DTR_DRILL_KEYS = [
  "fromDate",
  "toDate",
  "departmentId",
  "branchId",
  "payrollGroupId",
  "employeeId",
] as const;

export interface DtrDrillScope {
  departmentId?: string;
  branchId?: string;
  payrollGroupId?: string;
  employeeId?: string;
}

/** Computed per employee per day, so a drill covering many people is capped to a month. */
export const DTR_MAX_DAYS = 31;

/** One person's DTR can cover a year. */
export const DTR_EMPLOYEE_MAX_DAYS = 366;

export interface DtrDrillFilter extends DtrDrillScope {
  fromDate: string;
  toDate: string;
}

/**
 * Computed DTR for a range. Outside the menu, so it opens for whoever may calculate DTR -- the
 * menu screen it belongs with.
 */
export function dtrTarget(
  range: DateRange,
  scope: DtrDrillScope = {},
): DrillTarget {
  return {
    to: "/daily-time-record/detail",
    permission: "DTR Master:View",
    search: compact({ fromDate: range.from, toDate: range.to, ...scope }),
  };
}

const DTR_SCOPE_KEYS = [
  "departmentId",
  "branchId",
  "payrollGroupId",
  "employeeId",
] as const;

export function readDtrDrill(
  seed: Partial<Record<(typeof DTR_DRILL_KEYS)[number], unknown>>,
): DtrDrillFilter | null {
  const range = asDateRange(seed.fromDate, seed.toDate);
  if (!range) return null;
  const filter: DtrDrillFilter = { fromDate: range.from, toDate: range.to };
  for (const key of DTR_SCOPE_KEYS) {
    const value = asString(seed[key]);
    if (value) filter[key] = value;
  }
  return filter;
}

// ── Applications and schedule changes ────────────────────────────────────────

/** Each request list, by the key the Analytics request series use. */
const APPLICATION_PATHS = {
  leave: "/applications/leave",
  overtime: "/applications/overtime",
  officialBusiness: "/applications/official-business",
  passSlip: "/applications/pass-slip",
  loan: "/applications/deduction-application",
  profileUpdate: "/applications/profile-update-request",
  changeRestDay: "/change-schedule/change-rest-day",
  changeHoliday: "/change-schedule/change-holiday",
  workRotation: "/change-schedule/work-rotation",
} as const;

export type ApplicationKind = keyof typeof APPLICATION_PATHS;

export function isApplicationKind(value: unknown): value is ApplicationKind {
  return typeof value === "string" && Object.hasOwn(APPLICATION_PATHS, value);
}

export const APPLICATION_DRILL_KEYS = ["from", "to", "tab"] as const;

export interface ApplicationDrillOptions {
  range?: DateRange;
  tab?: ApprovalTab;
}

export function applicationListTarget(
  kind: ApplicationKind,
  { range, tab }: ApplicationDrillOptions = {},
): DrillTarget {
  return {
    to: APPLICATION_PATHS[kind],
    search: compact({ from: range?.from, to: range?.to, tab }),
  };
}

export interface ApplicationDrill {
  dateRange: [string, string] | null;
  tab?: ApprovalTab;
}

export function readApplicationDrill(
  seed: Partial<Record<(typeof APPLICATION_DRILL_KEYS)[number], unknown>>,
): ApplicationDrill {
  const range = asDateRange(seed.from, seed.to);
  const tab =
    seed.tab === "pending" || seed.tab === "processed" ? seed.tab : undefined;
  return { dateRange: range ? [range.from, range.to] : null, tab };
}

// ── Payroll runs ─────────────────────────────────────────────────────────────

/** Each run's batch list, by the API's PayrollType name. */
const PAYROLL_RUN_PATHS: Record<string, string> = {
  Regular: "/daily-time-record/for-payroll",
  ThirteenthMonth: "/daily-time-record/for-13th-month",
  LastPay: "/daily-time-record/for-last-pay",
  YearEndAdjustment: "/daily-time-record/for-year-end-adjustment",
};

export function payrollRunTarget(
  runType: string | null | undefined,
): DrillTarget | null {
  const to = runType ? PAYROLL_RUN_PATHS[runType] : undefined;
  return to ? { to } : null;
}
