import type { DrillTarget } from "@/shared/drilldown/drill-target";
import {
  DTR_EMPLOYEE_MAX_DAYS,
  DTR_MAX_DAYS,
  dtrTarget,
  type DtrDrillScope,
  type EmployeeDrillFilter,
} from "@/shared/drilldown/drill-screens";
import {
  lastDays,
  periodRange,
  type DateRange,
} from "@/shared/drilldown/drill-search.util";
import type { AnalyticsFilter, AnalyticsRow } from "../models/analytics.model";

/**
 * Where an Analytics page's figures drill into, per breakdown, KPI and series key. Each page
 * declares its own; a key that's missing has nothing to open. `filter` is the range the figures
 * actually cover (the API may have shortened it) plus the page's other filters.
 */
export interface AnalyticsDrill {
  breakdowns?: Record<
    string,
    (row: AnalyticsRow, filter: AnalyticsFilter) => DrillTarget | null
  >;
  kpis?: Record<string, (filter: AnalyticsFilter) => DrillTarget | null>;
  series?: Record<
    string,
    (period: string, filter: AnalyticsFilter) => DrillTarget | null
  >;
}

export function rangeOf(filter: AnalyticsFilter): DateRange {
  return { from: filter.from, to: filter.to };
}

/** The page's own filters as employee list filters, so a drill stays in the same slice. */
export function employeeScope(filter: AnalyticsFilter): EmployeeDrillFilter {
  return {
    ...(filter.departmentId && { departmentIds: [filter.departmentId] }),
    ...(filter.branchId && { branchIds: [filter.branchId] }),
    ...(filter.payrollGroupId && { payrollGroupIds: [filter.payrollGroupId] }),
    ...(filter.employmentStatus && {
      employmentStatuses: [filter.employmentStatus],
    }),
  };
}

/** The page's own filters as DTR filters (the DTR can't filter by employment status). */
export function dtrScope(filter: AnalyticsFilter): DtrDrillScope {
  return {
    ...(filter.departmentId && { departmentId: filter.departmentId }),
    ...(filter.branchId && { branchId: filter.branchId }),
    ...(filter.payrollGroupId && { payrollGroupId: filter.payrollGroupId }),
  };
}

/** The DTR for the page's slice: the most recent month of the range. */
export function dtrForRange(
  filter: AnalyticsFilter,
  scope: DtrDrillScope = {},
): DrillTarget {
  return dtrTarget(lastDays(rangeOf(filter), DTR_MAX_DAYS), {
    ...dtrScope(filter),
    ...scope,
  });
}

/** The DTR for one month of a trend. */
export function dtrForPeriod(
  period: string,
  filter: AnalyticsFilter,
): DrillTarget | null {
  const range = periodRange(period, rangeOf(filter));
  return range ? dtrTarget(range, dtrScope(filter)) : null;
}

/** One employee's DTR over the range (up to a year). */
export function dtrForEmployee(
  row: AnalyticsRow,
  filter: AnalyticsFilter,
): DrillTarget | null {
  return row.key
    ? dtrTarget(lastDays(rangeOf(filter), DTR_EMPLOYEE_MAX_DAYS), {
        employeeId: row.key,
      })
    : null;
}
