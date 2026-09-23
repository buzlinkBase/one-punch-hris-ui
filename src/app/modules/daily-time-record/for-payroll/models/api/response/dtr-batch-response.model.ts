export interface DtrBatchModel {
  // The DTRBatch header row's own id -- undefined for a legacy batch that predates that entity,
  // in which case approvalStatus is reported as "Approved" (already usable before this feature
  // existed). See backend DailyRecordService.GetBatches.
  id?: string | null;
  code: string;
  fromDate: string;
  toDate: string;
  employeeCount: number;
  isPosted: boolean;
  postingDescription?: string | null;
  isPayrollGenerated: boolean;
  approvalStatus?: "ForApproval" | "Approved" | "Declined" | "Cancelled";
}
