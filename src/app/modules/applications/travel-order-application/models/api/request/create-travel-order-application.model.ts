export interface CreateTravelOrderApplication {
  employeeId: string;
  startDate: string;
  endDate: string;
  travelDayType: string;
  destination: string;
  classification: string;
  purpose: string;
  cost: number;
  applicationRemarks?: string;
}
