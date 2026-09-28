import dayjs, { type Dayjs } from "dayjs";
import type {
  AttInfo,
  CleanAttendanceLogColumnar,
} from "@/app/modules/timekeeping/raw-logs/models/api/response/raw-attendance-log.model";
import { LOG_KEYS } from "@/app/modules/timekeeping/incomplete-punches/utils/incomplete-punch.util";
import type { PassSlipPrefillSearch } from "@/app/modules/portal/pass-slip/utils/pass-slip-prefill";

// The processor sends DateTime.MinValue (year 1) when the day has no shift.
function shiftTime(value: string | null | undefined): Dayjs | null {
  if (!value) return null;
  const t = dayjs(value);
  return t.isValid() && t.year() > 1900 ? t : null;
}

function punchTimes(row: CleanAttendanceLogColumnar): Dayjs[] {
  const entries = LOG_KEYS.map((k) => row[k] as AttInfo | null);
  const present = entries.filter((e): e is AttInfo => e !== null);
  return present.map((e) => dayjs(e.workTime));
}

/**
 * The punches an incomplete day is missing, from its shift:
 * - no punches at all → both the shift's start (time in) and end (time out);
 * - an odd number → the first punch tells which side is missing: when it sits nearer the
 *   shift start the day began normally and lacks its time out, otherwise it lacks its time in.
 * Without a shift nothing can be inferred, so only the date is prefilled.
 */
export function buildPassSlipPrefill(
  row: CleanAttendanceLogColumnar,
): PassSlipPrefillSearch {
  const prefill: PassSlipPrefillSearch = {
    date: dayjs(row.workDate).format("YYYY-MM-DD"),
  };
  const start = shiftTime(row.shiftStart);
  const end = shiftTime(row.shiftEnd);
  if (!start || !end) return prefill;

  const punches = punchTimes(row);
  if (punches.length === 0) {
    prefill.timeIn = start.format("HH:mm");
    prefill.timeOut = end.format("HH:mm");
    return prefill;
  }

  const first = punches[0];
  const nearerStart = Math.abs(first.diff(start)) <= Math.abs(first.diff(end));
  if (nearerStart) prefill.timeOut = end.format("HH:mm");
  else prefill.timeIn = start.format("HH:mm");
  return prefill;
}
