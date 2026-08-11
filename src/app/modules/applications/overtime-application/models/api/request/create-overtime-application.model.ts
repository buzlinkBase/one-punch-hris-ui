export interface CreateOvertimeApplication {
  employeeId: string;
  otDate: string;
  startTime: string | null;
  endTime: string | null;
  manualOtMinutes: number;
  isManualEntry: boolean;
  remarks: string;
  approvalStatus?: string;
}
