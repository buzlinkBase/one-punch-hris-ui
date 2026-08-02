export interface LeaveTypeResponse {
  id: string;
  code: string;
  category?: string;
  description: string;
  credits: number;
  paySource: string;
  leaveReset: string;
  remarks: string;
}
