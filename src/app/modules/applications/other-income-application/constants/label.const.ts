export const OTHER_INCOME_APPLICATION_LABEL = {
  MODULE: "Other Income Applications",
  TITLE: "Other Income Applications",
  SUBTITLE: "Record employee allowances and other income disbursements.",
  CREATE_TITLE: "New Income Application",
  EDIT_TITLE: "Edit Income Application",
};

export const FREQUENCY_OPTIONS = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "SemiMonthly", label: "Semi-Monthly" },
  { value: "Monthly", label: "Monthly" },
];

export const FREQUENCY_LABEL: Record<string, string> = {
  Daily: "Daily",
  Weekly: "Weekly",
  SemiMonthly: "Semi-Monthly",
  Monthly: "Monthly",
};

// Weekly, semi-monthly and monthly are the only frequencies an attendance gate can cover.
export const PERIODIC_FREQUENCY_OPTIONS = FREQUENCY_OPTIONS.filter((o) =>
  ["Weekly", "SemiMonthly", "Monthly"].includes(o.value),
);

export const PAY_MODE_OPTIONS = [
  {
    value: "FixedSchedule",
    label: "Fixed schedule",
    description: "Paid on set dates. No attendance condition.",
  },
  {
    value: "PerQualifyingDay",
    label: "Per qualifying day",
    description:
      "A daily amount, paid only for each day the employee meets the attendance rule.",
  },
  {
    value: "PeriodicGated",
    label: "Weekly / semi-monthly / monthly with attendance",
    description:
      "One payment per week, cut-off or month, paid only if the attendance rule is met in that period.",
  },
];

export const PAY_MODE_LABEL: Record<string, string> = Object.fromEntries(
  PAY_MODE_OPTIONS.map((o) => [o.value, o.label]),
);

export {
  ALL_DAY_TYPE_BITS,
  ALL_WEEKDAY_BITS,
  ATTENDANCE_BASIS_OPTIONS,
  DAY_TYPE_OPTIONS,
  SKIP_REASON_LABEL,
  WEEKDAY_OPTIONS,
} from "@/shared/constants/attendance-rule.const";
