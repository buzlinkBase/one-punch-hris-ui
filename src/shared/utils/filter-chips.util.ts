import dayjs from "dayjs";

export interface ChipOption {
  value: string;
  label: string;
}

/** Display label of the option matching `id`, or undefined when nothing is selected. */
export function labelOf(
  options: ChipOption[],
  id?: string,
): string | undefined {
  return options.find((o) => o.value === id)?.label;
}

/** "Jan 01 – Jan 15, 2026" chip text for a date range, or undefined when either end is missing. */
export function formatRangeChip(
  from?: string | null,
  to?: string | null,
): string | undefined {
  if (!from || !to) return undefined;
  return `${dayjs(from).format("MMM DD")} – ${dayjs(to).format("MMM DD, YYYY")}`;
}

/** Drops empty chips so callers can pass optional labels inline. */
export function compactChips(chips: (string | undefined | null)[]): string[] {
  return chips.filter((c): c is string => !!c);
}
