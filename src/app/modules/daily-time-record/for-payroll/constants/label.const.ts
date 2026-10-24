// PayrollBatch.ApprovalStatus -- drives the Saved Payroll Runs tab's status tag
// (PayrollBatchesTab) and the Payroll Summary report tabs' Status filter (payroll-summary.tsx).
// Same colors/labels as every other module's own approval status constants (e.g.
// profile-update-request's).
export const APPROVAL_STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
};

export const APPROVAL_STATUS_LABEL: Record<string, string> = {
  ForApproval: "For Approval",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Declined: "Declined",
};

// Mirrors hrms-api's PayrollsController.RunTypeFeature -- Approve/Decline/Delete/Request
// Deletion on a batch need the permission for that specific batch's run type, not a fixed code.
// Used by payroll-batches-tab.tsx (the persistent batch list, now on the Payroll Run page).
export const RUN_TYPE_FEATURE: Record<string, string> = {
  Regular: "Payroll Run",
  ThirteenthMonth: "13th Month Run",
  LastPay: "Last Pay Run",
  YearEndAdjustment: "Year-End Adjustment Run",
};

export const PAYROLL_TYPE_LABEL: Record<string, string> = {
  Regular: "Regular",
  ThirteenthMonth: "13th Month",
  LastPay: "Last Pay",
  YearEndAdjustment: "Year-End Adjustment",
};

// Why a run does or doesn't take an employee's deductions (hrms-api DeductionCarrierResolver
// reasons) -- shown as a tooltip on the preview's Deductions column. Only present when the company
// policy "which payroll run takes the deductions" is on.
export const DEDUCTION_REASON_TEXT: Record<string, string> = {
  PrimaryClient: "This run pays the employee's own client.",
  MostDays: "The employee worked the most days for this client.",
  FirstRun: "This is the first run generated for the cutoff.",
  NoDays: "The employee has no worked days to rank, so this run takes it.",
  ChosenByOperator: "You chose to take the deductions in this run.",
  SkippedByOperator: "You chose to skip the deductions in this run.",
  NotChosen:
    "Deductions are only taken where you choose. Switch this on to take them here.",
  ClaimedElsewhere:
    "Another saved run already takes this employee's deductions for this cutoff.",
};

export const deductionReasonText = (reason: string): string => {
  // "PrimaryClientNotWorked:MostDays" -- their own client wasn't worked, so the busiest client decides.
  if (reason.startsWith("PrimaryClientNotWorked"))
    return "The employee didn't work their own client this cutoff, so the client they worked the most days for takes it.";
  return DEDUCTION_REASON_TEXT[reason] ?? reason;
};

export const FOR_PAYROLL_LABEL = {
  TITLE: "For Payroll",
  BIO_ID: "BioId",
  EMPLOYEE: "Employee",
  LATE: "Late",
  UNDER_TIME: "Under Time",
  REG_NET: "Reg. Net",
  NET_OVERTIME: "Net Overtime",
  ND: "ND",
  ND_OT: "ND OT",
  REST_DAY_NET: "Rest Day Net",
  REST_DAY_OT: "Rest Day OT",
  RD_ND: "RD ND",
  RD_ND_OT: "RD ND OT",
  LH: "LH",
  LH_OT: "LH OT",
  LH_ND: "LH ND",
  LH_ND_OT: "LH ND OT",
  SPH: "SPH",
  SPH_OT: "SPH OT",
  SPH_ND: "SPH ND",
  SPH_ND_OT: "SPH ND OT",
  FILTER_FROM_DATE: "From",
  FILTER_TO_DATE: "To",
  FILTER_DEPARTMENT: "Department",
  FILTER_CLIENT: "Client",
  FILTER_EMPLOYEE: "Employee",
  FILTER_PAYROLL_GROUP: "Payroll Group",
};
