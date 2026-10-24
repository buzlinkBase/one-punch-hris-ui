import dayjs from "dayjs";

/** "Today", "Tomorrow" or "In 3d · Oct 21" for a birthday `daysUntil` days away from `today`. */
export function birthdayWhen(
  daysUntil: number,
  today: dayjs.Dayjs = dayjs(),
): string {
  if (daysUntil <= 0) return "Today";
  if (daysUntil === 1) return "Tomorrow";
  return `In ${daysUntil}d · ${today.add(daysUntil, "day").format("MMM D")}`;
}
