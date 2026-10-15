import dayjs, { type Dayjs } from "dayjs";

export type OtherIncomePayMode =
  "FixedSchedule" | "PerQualifyingDay" | "PeriodicGated";

export interface OtherIncomeScheduleRow {
  // The stored row's id; absent for freshly generated rows, which the API adds as new.
  id?: string;
  index: number;
  date: string;
  amount: number;
  // PeriodicGated rows: the attendance window the payment covers (inclusive).
  periodStart?: string;
  periodEnd?: string;
  // Set by payroll, echoed back by the API; only present on stored rows.
  isSkipped?: boolean;
  skipReason?: string | null;
  consumedByPayrollId?: string | null;
}

export interface OtherIncomeScheduleParams {
  payMode: OtherIncomePayMode;
  startDate: string;
  endDate: string;
  frequency: string;
  amount: number;
  // Bit mask of OtherIncomeWeekdays (Mon = 1 ... Sun = 64); PerQualifyingDay only.
  applicableDays: number;
}

const MAX_ROWS = 500;
const DATE_FORMAT = "YYYY-MM-DD";

// Mon = 1 ... Sun = 64, matching the API's OtherIncomeWeekdays.
export function weekdayBit(date: Dayjs): number {
  return 1 << ((date.day() + 6) % 7);
}

export function maskToBits(mask: number, allBits: number[]): number[] {
  return allBits.filter((bit) => (mask & bit) !== 0);
}

export function bitsToMask(bits: number[]): number {
  return bits.reduce((mask, bit) => mask | bit, 0);
}

const FIXED_STEP_DAYS: Record<string, number> = {
  Daily: 1,
  Weekly: 7,
  SemiMonthly: 15,
  Monthly: 30,
};

function nextFixedDate(current: Dayjs, frequency: string): Dayjs {
  if (frequency === "SemiMonthly") {
    return current.date() <= 15
      ? current.endOf("month").startOf("day")
      : current.add(1, "month").startOf("month").add(14, "day");
  }
  return current.add(FIXED_STEP_DAYS[frequency] ?? 30, "day");
}

// The original behaviour: one row per payment date, the same amount on each.
function generateFixed(
  start: Dayjs,
  end: Dayjs,
  frequency: string,
  amount: number,
): OtherIncomeScheduleRow[] {
  const rows: OtherIncomeScheduleRow[] = [];
  let current = start;
  while (!current.isAfter(end, "day") && rows.length < MAX_ROWS) {
    rows.push({
      index: rows.length + 1,
      date: current.format(DATE_FORMAT),
      amount,
    });
    current = nextFixedDate(current, frequency);
  }
  return rows;
}

// One candidate row per applicable weekday. Whether the day is actually paid is decided at payroll
// against that day's DTR, so this is the most the employee could earn.
function generatePerDay(
  start: Dayjs,
  end: Dayjs,
  amount: number,
  applicableDays: number,
): OtherIncomeScheduleRow[] {
  const rows: OtherIncomeScheduleRow[] = [];
  let current = start;
  while (!current.isAfter(end, "day") && rows.length < MAX_ROWS) {
    if ((applicableDays & weekdayBit(current)) !== 0) {
      rows.push({
        index: rows.length + 1,
        date: current.format(DATE_FORMAT),
        amount,
      });
    }
    current = current.add(1, "day");
  }
  return rows;
}

// One row per week or month window, dated on the window's last day (or the end date if the window
// runs past it). The attendance gate is judged over [periodStart, periodEnd].
function generatePeriodic(
  start: Dayjs,
  end: Dayjs,
  frequency: string,
  amount: number,
): OtherIncomeScheduleRow[] {
  const rows: OtherIncomeScheduleRow[] = [];
  let windowStart = start;
  while (!windowStart.isAfter(end, "day") && rows.length < MAX_ROWS) {
    const naturalEnd =
      frequency === "Monthly"
        ? windowStart.add(1, "month").subtract(1, "day")
        : windowStart.add(6, "day");
    const windowEnd = naturalEnd.isAfter(end, "day") ? end : naturalEnd;
    rows.push({
      index: rows.length + 1,
      date: windowEnd.format(DATE_FORMAT),
      amount,
      periodStart: windowStart.format(DATE_FORMAT),
      periodEnd: windowEnd.format(DATE_FORMAT),
    });
    windowStart = windowEnd.add(1, "day");
  }
  return rows;
}

export function generateOtherIncomeSchedule(
  params: OtherIncomeScheduleParams,
): OtherIncomeScheduleRow[] {
  const { payMode, startDate, endDate, frequency, amount, applicableDays } =
    params;
  if (!startDate || !endDate || !amount) return [];

  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (end.isBefore(start, "day")) return [];

  switch (payMode) {
    case "PerQualifyingDay":
      return generatePerDay(start, end, amount, applicableDays);
    case "PeriodicGated":
      return generatePeriodic(start, end, frequency, amount);
    default:
      return frequency ? generateFixed(start, end, frequency, amount) : [];
  }
}
