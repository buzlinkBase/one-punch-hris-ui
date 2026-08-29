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
