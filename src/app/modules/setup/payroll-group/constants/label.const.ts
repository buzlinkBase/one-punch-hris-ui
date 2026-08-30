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
