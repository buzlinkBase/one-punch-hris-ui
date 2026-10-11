import dayjs, { type Dayjs } from "dayjs";
import type { AnalyticsFilter } from "../models/analytics.model";

export const ANALYTICS_DATE_FORMAT = "YYYY-MM-DD";

/** The API caps a range at 24 months (hrms-api AnalyticsPeriod.MaxMonths). */
export const ANALYTICS_MAX_MONTHS = 24;

const OPTIONAL_KEYS = [
  "departmentId",
  "branchId",
  "payrollGroupId",
  "employmentStatus",
] as const;

function isDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    // Round-trips, so an impossible date like 2026-02-30 is rejected too.
    dayjs(value).format(ANALYTICS_DATE_FORMAT) === value
  );
}

/** The last 12 months, through today: the first day of the month 11 months back to today. */
export function defaultAnalyticsFilter(
  today: Dayjs = dayjs(),
): AnalyticsFilter {
  return {
    from: today
      .subtract(11, "month")
      .startOf("month")
      .format(ANALYTICS_DATE_FORMAT),
    to: today.format(ANALYTICS_DATE_FORMAT),
  };
}

/**
 * The filter a page's URL asks for. Anything missing or malformed falls back to the default
 * range, so a hand-edited or old bookmark still opens.
 */
export function filterFromSearch(
  search: Record<string, unknown>,
  today: Dayjs = dayjs(),
): AnalyticsFilter {
  const fallback = defaultAnalyticsFilter(today);
  const hasRange = isDate(search.from) && isDate(search.to);
  const filter: AnalyticsFilter = {
    from: hasRange ? (search.from as string) : fallback.from,
    to: hasRange ? (search.to as string) : fallback.to,
  };
  for (const key of OPTIONAL_KEYS) {
    const value = search[key];
    if (typeof value === "string" && value.trim()) filter[key] = value.trim();
  }
  return filter;
}

/** The URL search params for a filter -- empty optional filters are left out. */
export function filterToSearch(
  filter: AnalyticsFilter,
): Record<string, string> {
  const search: Record<string, string> = { from: filter.from, to: filter.to };
  for (const key of OPTIONAL_KEYS) {
    const value = filter[key];
    if (value) search[key] = value;
  }
  return search;
}

/** "Mar 2026" from the API's "2026-03" period label. */
export function formatPeriod(period: string): string {
  const month = dayjs(`${period}-01`);
  return month.isValid() ? month.format("MMM YYYY") : period;
}
