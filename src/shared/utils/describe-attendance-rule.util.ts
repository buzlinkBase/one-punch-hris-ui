import {
  ALL_DAY_TYPE_BITS,
  ALL_WEEKDAY_BITS,
  DAY_TYPE_OPTIONS,
  WEEKDAY_OPTIONS,
} from "@/shared/constants/attendance-rule.const";

export interface AttendanceRuleSummaryInput {
  // Whether the sentence is about money paid to the employee or taken from them.
  kind: "income" | "deduction";
  payMode: string;
  amount: number;
  frequency: string;
  attendanceBasis: string;
  minHours: number | null;
  maxLateMinutes: number | null;
  maxUndertimeMinutes: number | null;
  // Bit values of the selected weekdays / day types.
  applicableDays: number[];
  dayTypes: number[];
  requireAllDays: boolean;
  minQualifyingDays: number | null;
  // Deductions only: what happens to a day that doesn't qualify.
  onMiss?: string;
}

function labelsOf(
  selected: number[],
  options: { value: number; label: string }[],
): string {
  return options
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label)
    .join(", ");
}

function minutes(value: number): string {
  return `${value} minute${value === 1 ? "" : "s"}`;
}

// A plain-language sentence of what the chosen rule will do, shown under the form so HR can check
// the rule says what they meant before saving.
export function describeAttendanceRule(
  input: AttendanceRuleSummaryInput,
): string {
  const isIncome = input.kind === "income";
  const verb = isIncome ? "Pays" : "Deducts";

  if (input.payMode === "FixedSchedule") {
    return isIncome
      ? "Paid on each scheduled date, whatever the employee's attendance."
      : "Deducted on each scheduled date, whatever the employee's attendance.";
  }

  const amount = (input.amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
  });
  const presence =
    input.attendanceBasis === "WorkedOrPaidLeave"
      ? "worked or was on paid leave"
      : "worked";

  const conditions: string[] = [];
  if (input.minHours) conditions.push(`at least ${input.minHours} hours`);
  if (input.maxLateMinutes !== null) {
    conditions.push(
      input.maxLateMinutes === 0
        ? "no lateness"
        : `no more than ${minutes(input.maxLateMinutes)} late`,
    );
  }
  if (input.maxUndertimeMinutes !== null) {
    conditions.push(
      input.maxUndertimeMinutes === 0
        ? "no undertime"
        : `no more than ${minutes(input.maxUndertimeMinutes)} of undertime`,
    );
  }
  const conditionText = conditions.length
    ? `, with ${conditions.join(" and ")}`
    : "";

  const allDays = ALL_WEEKDAY_BITS.every((b) =>
    input.applicableDays.includes(b),
  );
  const dayList = allDays
    ? "any day"
    : labelsOf(input.applicableDays, WEEKDAY_OPTIONS);
  // "each day" reads better than "each any day"; a subset reads "each Mon, Tue".
  const days = allDays ? "day" : dayList;
  const allTypes = ALL_DAY_TYPE_BITS.every((b) => input.dayTypes.includes(b));
  const typeText = allTypes
    ? ""
    : ` (${labelsOf(input.dayTypes, DAY_TYPE_OPTIONS).toLowerCase()} only)`;

  const missText = isIncome
    ? "skipped and not paid later"
    : input.onMiss === "Defer"
      ? "held back and taken in the next payroll instead"
      : "skipped and never deducted";

  if (input.payMode === "PerQualifyingDay") {
    return `${verb} ₱${amount} for each ${days}${typeText} the employee ${presence}${conditionText}. Days that don't qualify are ${missText}.`;
  }

  const period = input.frequency === "Monthly" ? "month" : "week";
  const required = input.requireAllDays
    ? `every applicable day (${dayList}${typeText})`
    : `at least ${input.minQualifyingDays ?? 1} applicable day(s) (${dayList}${typeText})`;
  return `${verb} ₱${amount} each ${period}, only if the employee ${presence}${conditionText} on ${required} of that ${period}. Otherwise that ${period}'s amount is ${missText}.`;
}
