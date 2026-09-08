export interface PortalPassSlipResponse {
  id: string;
  employeeId: string;
  applicationDate: string;
  departureTime: string;
  returnTime?: string | null;
  destination: string;
  purpose: string;
  remarks?: string;
  approvalStatus: string;
  batchCode?: string;
  createdAt?: string;
}
