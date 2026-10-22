import dayjs, { type Dayjs } from "dayjs";

export const DRILL_DATE_FORMAT = "YYYY-MM-DD";

export interface DateRange {
  from: string;
  to: string;
}

/** A real `YYYY-MM-DD` date -- an impossible one like 2026-02-30 is rejected too. */
export function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    dayjs(value).format(DRILL_DATE_FORMAT) === value
  );
}

/** A non-blank string search param, trimmed. */
export function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** A list search param: the non-blank strings of an array, or a lone string as a one-item list. */
export function asStringArray(value: unknown): string[] | undefined {
  const items = (Array.isArray(value) ? value : [value])
    .map(asString)
    .filter((v): v is string => v !== undefined);
  return items.length > 0 ? items : undefined;
}

/** Both ends of a range, or nothing when either is missing or malformed. */
export function asDateRange(from: unknown, to: unknown): DateRange | undefined {
  return isIsoDate(from) && isIsoDate(to) ? { from, to } : undefined;
}

/** The given day as a one-day range. */
export function dayRange(day: Dayjs): DateRange {
  const date = day.format(DRILL_DATE_FORMAT);
  return { from: date, to: date };
}

/**
 * The days of an Analytics month ("2026-09"), clipped to the page's range so the first and last
 * months only cover what the figures counted.
 */
export function periodRange(
  period: string,
  within: DateRange,
): DateRange | null {
  const month = dayjs(`${period}-01`);
  if (!/^\d{4}-\d{2}$/.test(period) || !month.isValid()) return null;
  const start = month.format(DRILL_DATE_FORMAT);
  const end = month.endOf("month").format(DRILL_DATE_FORMAT);
  return {
    from: start < within.from ? within.from : start,
    to: end > within.to ? within.to : end,
  };
}

/**
 * The most recent `maxDays` of a range (all of it when it's shorter) -- for screens that compute
 * per day, where a two-year range would be far more than anyone reads.
 */
export function lastDays(range: DateRange, maxDays: number): DateRange {
  const earliest = dayjs(range.to)
    .subtract(maxDays - 1, "day")
    .format(DRILL_DATE_FORMAT);
  return { from: range.from < earliest ? earliest : range.from, to: range.to };
}

export interface HireDateRange {
  hireDateFrom?: string;
  hireDateTo?: string;
}

/**
 * The hire dates that put someone in a tenure band as of `asOf`. The API keys a band by its
 * years, "{from}-{to}" with the upper bound exclusive ("1-3"), and "10-" for the open-ended last
 * band. Null for a key in any other shape.
 */
export function tenureHireRange(
  key: string,
  asOf: Dayjs,
): HireDateRange | null {
  const match = /^(\d+)-(\d*)$/.exec(key);
  if (!match) return null;
  const fromYears = Number(match[1]);
  const toYears = match[2] === "" ? null : Number(match[2]);
  if (toYears !== null && toYears <= fromYears) return null;
  return {
    hireDateTo: asOf.subtract(fromYears, "year").format(DRILL_DATE_FORMAT),
    ...(toYears !== null && {
      hireDateFrom: asOf
        .subtract(toYears, "year")
        .add(1, "day")
        .format(DRILL_DATE_FORMAT),
    }),
  };
}
