import type { CleanAttendanceLogColumnar } from "@/app/modules/timekeeping/raw-logs/models/api/response/raw-attendance-log.model";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

export const LOG_KEYS = Array.from(
  { length: 20 },
  (_, i) => `log${i + 1}` as keyof CleanAttendanceLogColumnar,
);

export function countLogs(row: CleanAttendanceLogColumnar): number {
  return LOG_KEYS.filter((k) => row[k] !== null).length;
}

/**
 * The incomplete-log rule shared by the admin Incomplete Punches screen and the Employee
 * Portal's My Incomplete Logs: a real employee row (not the processor's placeholder) whose day
 * has no punches, or an odd number of them (a time-in without its time-out, or vice versa).
 * The placeholder is recognised by its empty employeeId only -- an employee without an
 * Employee No. is still a real row.
 */
export function filterIncompletePunches(
  rows: CleanAttendanceLogColumnar[],
): CleanAttendanceLogColumnar[] {
  return rows
    .filter((r) => r.employeeId !== EMPTY_GUID)
    .filter((r) => {
      const count = countLogs(r);
      return count === 0 || count % 2 !== 0;
    });
}
