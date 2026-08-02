export interface TravelOrderApplicationResponse {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  travelDayType: string;
  destination: string;
  classification: string;
  purpose: string;
  cost: number;
  applicationRemarks?: string;
  approvalStatus: string;
  days: number;
  applicationDate: string;
  reference?: string;
}
