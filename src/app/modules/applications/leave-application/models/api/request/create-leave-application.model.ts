export interface CreateLeaveApplication {
  employeeId: string;
  leaveId: string;
  durationType: "SingleDay" | "MultiDay" | "Partial";
  leaveDateFrom: string;
  leaveDateTo: string;
  dayFraction: "FullDay" | "AM" | "PM";
  payType: string;
  isManualEntry: boolean;
  startTime?: string | null;
  endTime?: string | null;
  totalMinutes?: number | null;
  applicationRemarks?: string;
  supportingDocumentUrl?: string;
  approvalStatus?: string;
}
