export interface PassSlipResponse {
  id: string;
  employeeId: string;
  employeeName?: string;
  applicationDate: string;
  departureTime: string;
  returnTime?: string;
  destination: string;
  purpose: string;
  approvalStatus: string;
  remarks?: string;
  batchCode?: string;
}
