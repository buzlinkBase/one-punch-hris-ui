export interface TravelOrderApplicationResponse {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  isManualEntry?: boolean;
  startTime?: string | null;
  endTime?: string | null;
  totalMinutes?: number | null;
  destination: string;
  classification: string;
  purpose: string;
  cost: number;
  applicationRemarks?: string;
  approvalStatus: string;
  days: number;
  applicationDate: string;
  reference?: string;
  createdAt?: string;
}
