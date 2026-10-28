export const DEDUCTION_APPLICATION_LABEL = {
  MODULE: "Loans & Deductions",
  TITLE: "Loans & Deductions",
  SUBTITLE: "Record employee loans and scheduled deductions.",
  CREATE_TITLE: "New Loan / Deduction",
  EDIT_TITLE: "Edit Loan / Deduction",
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
    description: "Taken on set dates. No attendance condition.",
  },
  {
    value: "PerQualifyingDay",
    label: "Per qualifying day",
    description:
      "A daily amount, taken only for each day the employee meets the attendance rule.",
  },
  {
    value: "PeriodicGated",
    label: "Weekly / semi-monthly / monthly with attendance",
    description:
      "One amount per week, cut-off or month, taken only if the attendance rule is met in that period.",
  },
];

export const PAY_MODE_LABEL: Record<string, string> = Object.fromEntries(
  PAY_MODE_OPTIONS.map((o) => [o.value, o.label]),
);

export const ON_MISS_OPTIONS = [
  { value: "Skip", label: "Skip it. Never deduct it." },
  { value: "Defer", label: "Hold it back and deduct it in the next payroll." },
];

export const PERIODS_PER_YEAR: Record<string, number> = {
  Daily: 365,
  Weekly: 52,
  SemiMonthly: 24,
  Monthly: 12,
};
