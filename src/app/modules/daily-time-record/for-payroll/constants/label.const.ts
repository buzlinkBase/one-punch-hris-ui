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
