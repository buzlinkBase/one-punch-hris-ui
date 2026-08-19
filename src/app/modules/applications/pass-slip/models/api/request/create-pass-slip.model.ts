export interface CreatePassSlip {
  employeeId: string;
  applicationDate: string;
  departureTime: string;
  returnTime?: string;
  destination: string;
  purpose: string;
  remarks?: string;
}
