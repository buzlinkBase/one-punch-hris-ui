export const PAYROLL_GROUP_LABEL = {
  TITLE: "Payroll Group",
  CODE: "Code",
  NAME: "Name",
  PAYROLL_FREQUENCY: "Payroll Frequency",
  STATUTORY_DEDUCTION_SCHEDULE: "Statutory Deduction Release Schedule",
  CUTOFF_DAYS: "Cutoff Days",
  STATUS: "Status",
  CREATE_TITLE: "Create Payroll Group",
  EDIT_TITLE: "Edit Payroll Group",
};

export const PAYROLL_FREQUENCY_OPTIONS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "SEMI_MONTHLY", label: "Semi-Monthly" },
  { value: "MONTHLY", label: "Monthly" },
];

export const STATUTORY_DEDUCTION_SCHEDULE_OPTIONS = [
  { value: "PerPayroll", label: "Every cutoff (prorated)" },
  {
    value: "FirstHalfMonth",
    label: "First cutoff of the month (full amount)",
  },
  {
    value: "SecondHalfMonth",
    label: "Last cutoff of the month (full amount)",
  },
];

// PerPayroll withholds balance ÷ configured-cutoff-count on every non-last cutoff, then the
// last cutoff always takes the exact remaining balance as a true-up (Table*SemiMonthlyCalculator).
// For a standard 2-cutoff Semi-Monthly group that IS a 50/50 split with true-up — same value,
// clearer label for the frequency where it actually reads as "50/50".
export function getStatutoryDeductionScheduleOptions(
  payrollFrequency?: string,
) {
  if (payrollFrequency !== "SEMI_MONTHLY") {
    return STATUTORY_DEDUCTION_SCHEDULE_OPTIONS;
  }
  return STATUTORY_DEDUCTION_SCHEDULE_OPTIONS.map((option) =>
    option.value === "PerPayroll"
      ? {
          ...option,
          label: "50/50 split (half at first cutoff, balance at second)",
        }
      : option,
  );
}

export const STATUTORY_DEDUCTION_SCHEDULE_NOTE =
  "Applies to Fixed-salary employees. Variable-salary employees always deduct against their actual gross earned per cutoff, never a projected or averaged monthly income, regardless of this setting.";

// Recommended cutoff-day starting points per frequency — the most common conventions
// among PH companies. All fully editable afterward: add/remove rows, change the day,
// toggle "End of Month". SEMI_MONTHLY defaults to the 10th/25th "straight cutoff" widely
// used by BPOs and payroll processors; companies that instead cut off on the 15th/EOM can
// just edit the 10 to 15.
type CutoffPreset = { day: number; isEndOfMonth: boolean; label: string };

export const CUTOFF_DAY_PRESETS: Record<
  "DAILY" | "WEEKLY" | "SEMI_MONTHLY" | "MONTHLY",
  CutoffPreset[]
> = {
  DAILY: [{ day: 31, isEndOfMonth: true, label: "Cutoff" }],
  WEEKLY: [
    { day: 7, isEndOfMonth: false, label: "Week 1" },
    { day: 14, isEndOfMonth: false, label: "Week 2" },
    { day: 21, isEndOfMonth: false, label: "Week 3" },
    { day: 31, isEndOfMonth: true, label: "Week 4" },
  ],
  SEMI_MONTHLY: [
    { day: 10, isEndOfMonth: false, label: "1st Cutoff" },
    { day: 25, isEndOfMonth: false, label: "2nd Cutoff" },
  ],
  MONTHLY: [{ day: 31, isEndOfMonth: true, label: "Monthly Cutoff" }],
};
