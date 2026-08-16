export interface OvertimeApplicationResponse {
  id: string;
  employeeId: string;
  otDate: string;
  startTime: string;
  endTime: string;
  remarks: string;
  approvalStatus: string;
  isManualEntry: boolean;
  manualOTMinutes: number;
  otBeforeOverride: number;
  flexiEndTime: boolean;
  paidByNetDutyTime: boolean;
  overTimeThreshold: number;
  createdAt?: string;
}
