export interface TardinessResponse {
  workDate: string;
  employeeNo: string;
  fullName: string | null;
  department: string | null;
  scheduledIn: string;
  actualIn: string | null;
  gracePeriodMinutes: number;
  tardinessMinutes: number;
  deductibleMinutes: number;
  isWithinGracePeriod: boolean;
}
