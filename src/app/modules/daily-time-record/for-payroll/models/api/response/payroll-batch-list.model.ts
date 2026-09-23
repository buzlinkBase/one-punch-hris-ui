// Mirrors backend PayrollBatchListModel — the batch-list projection backing the Saved Payroll Runs
// tab (Approve/Decline/Delete/Request Deletion a whole Generate run), queried directly against
// PayrollBatch rather than derived by grouping child Payroll rows client-side.
export interface PayrollBatchListModel {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate?: string | null;
  remarks?: string | null;
  employeeCount: number;
  isPosted: boolean;
  approvalStatus: "ForApproval" | "Approved" | "Declined" | "Cancelled";
  generatedByEmployeeId: string;
  postedBy?: string | null;
  payrollType: "Regular" | "ThirteenthMonth" | "LastPay" | "YearEndAdjustment";
  // See backend PayrollBatch.PendingDeletion/RequestedDeletionByEmployeeId.
  pendingDeletion: boolean;
  requestedDeletionByEmployeeId?: string | null;
}
