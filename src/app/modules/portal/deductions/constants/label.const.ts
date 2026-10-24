export const PORTAL_DEDUCTIONS_LABEL = {
  TITLE: "My Deductions",
  SUBTITLE: "Your active loans and deductions. Tap a name to see its ledger.",
  EMPTY: "No active deductions",
  EMPTY_HINT: "Fully paid or pending loans are not listed here.",
  LEDGER_TITLE: "Deduction Ledger",
};

export const LEDGER_STATE_LABEL = {
  paid: "Paid",
  next: "Next",
  upcoming: "Upcoming",
  skipped: "Skipped",
} as const;

export const LEDGER_STATE_COLOR = {
  paid: "green",
  next: "blue",
  upcoming: "default",
  skipped: "orange",
} as const;
