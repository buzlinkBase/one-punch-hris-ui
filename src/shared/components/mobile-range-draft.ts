import type { Dayjs } from "dayjs";

export type DateRange = [Dayjs | null, Dayjs | null];

/** A one-sided pick, remembered against the value it was made on. */
export interface RangeDraft {
  range: DateRange;
  basis: string;
}

export function rangeKey(value: DateRange | null | undefined): string {
  if (!value) return "";
  return `${value[0]?.valueOf() ?? ""}|${value[1]?.valueOf() ?? ""}`;
}

/**
 * What the two stacked pickers show: the half-picked draft while it is still pending on the
 * same value, otherwise the caller's value. Once the caller's value changes (a full range was
 * emitted, or it was reset from outside) the draft no longer applies.
 */
export function shownRange(
  value: DateRange | null | undefined,
  draft: RangeDraft | null,
): DateRange {
  if (draft && draft.basis === rangeKey(value)) return draft.range;
  return value ?? [null, null];
}

export type RangePick =
  | { kind: "emit"; range: DateRange | null }
  | { kind: "draft"; range: DateRange };

/**
 * Same contract as antd's RangePicker: the caller hears only about a complete range (or a
 * clear). Picking one end alone is held as a draft -- emitting [from, null] made callers that
 * keep a range only when both ends are set drop it, so the first pick vanished and a date range
 * could never be set on a phone.
 */
export function pickRange(range: DateRange): RangePick {
  const [from, to] = range;
  if (from && to) return { kind: "emit", range };
  if (!from && !to) return { kind: "emit", range: null };
  return { kind: "draft", range };
}
