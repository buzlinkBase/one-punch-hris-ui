export interface BatchesModel {
  // The DTRBatch header row's own id -- undefined for a legacy batch that predates that entity,
  // in which case approvalStatus is reported as "Approved" (already usable before this feature
  // existed). See backend DailyRecordService.GetBatches.
  id?: string | null;
  code?: string;
  fromDate?: string;
  toDate?: string;
  employeeCount?: number;
  isPosted?: boolean;
  postingDescription?: string | null;
  // True once a payroll has already been generated from this DTR batch -- blocks Delete on the
  // backend independently of isPosted (DTR posting/approval is decoupled from Payroll
  // generation, so a batch can be un-posted again via the Unpost endpoint while a Payroll run
  // still references it). See backend DailyRecordService.DeleteAsync.
  isPayrollGenerated?: boolean;
  approvalStatus?: "ForApproval" | "Approved" | "Declined" | "Cancelled";
  generatedByEmployeeId?: string | null;
  payrollGroupId?: string | null;
  generatedAt?: string | null;
  // True while a deletion request on this already-posted batch awaits its own DtrDeletion
  // approval. approvalStatus stays "Approved" throughout -- this is a separate, orthogonal
  // concern. See backend DailyRecordService.RequestDeletionAsync.
  pendingDeletion?: boolean;
  requestedDeletionByEmployeeId?: string | null;
}
