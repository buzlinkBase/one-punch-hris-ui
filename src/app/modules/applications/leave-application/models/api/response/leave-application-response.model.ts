export interface LeaveApplicationResponse {
  id: string;
  employeeId: string;
  leaveId: string;
  durationType?: "SingleDay" | "MultiDay" | "Partial";
  leaveDateFrom: string;
  leaveDateTo: string;
  dayFraction?: "FullDay" | "AM" | "PM";
  payType: string;
  payoutMode?: "PerDay" | "OneTime";
  governmentAmount?: number | null;
  companyAmount?: number | null;
  releasePayrollDate?: string | null;
  // Null = inherit the leave type's EmployerAdvancesPayment default. See
  // leave-type-response.model.ts's own employerAdvancesPayment for that default.
  employerAdvancesPayment?: boolean | null;
  isManualEntry?: boolean;
  startTime?: string | null;
  endTime?: string | null;
  totalMinutes?: number | null;
  applicationRemarks?: string;
  supportingDocumentUrl?: string;
  approvalStatus: string;
  reviewedBy?: number;
  reviewedOn?: string;
  createdAt?: string;
  // Read-only — set exclusively via the dedicated PUT /leaveapplications/{id}/reimbursement
  // endpoint (Reimbursement List report), never through this form.
  reimbursementStatus?: "NotFiled" | "Filed" | "Reimbursed";
  reimbursementFiledDate?: string | null;
  reimbursementReceivedDate?: string | null;
  reimbursementReferenceNo?: string | null;
}
