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

export const PERIODS_PER_YEAR: Record<string, number> = {
  Daily: 365,
  Weekly: 52,
  SemiMonthly: 24,
  Monthly: 12,
};
