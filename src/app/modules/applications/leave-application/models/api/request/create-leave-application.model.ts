export interface CreateLeaveApplication {
  employeeId: string;
  leaveId: string;
  durationType: "SingleDay" | "MultiDay" | "Partial";
  leaveDateFrom: string;
  leaveDateTo: string;
  dayFraction: "FullDay" | "AM" | "PM";
  payType: string;
  payoutMode?: "PerDay" | "OneTime";
  governmentAmount?: number | null;
  companyAmount?: number | null;
  releasePayrollDate?: string | null;
  isManualEntry: boolean;
  startTime?: string | null;
  endTime?: string | null;
  totalMinutes?: number | null;
  applicationRemarks?: string;
  supportingDocumentUrl?: string;
  approvalStatus?: string;
}
