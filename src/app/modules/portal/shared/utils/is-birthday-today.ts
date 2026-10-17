import dayjs from "dayjs";

/** True when the calendar date of `dob` (an ISO date) falls on today's month and day. */
export function isBirthdayToday(dob?: string | null): boolean {
  if (!dob) return false;
  const birth = dayjs(dob);
  if (!birth.isValid()) return false;
  const today = dayjs();
  return birth.month() === today.month() && birth.date() === today.date();
}
