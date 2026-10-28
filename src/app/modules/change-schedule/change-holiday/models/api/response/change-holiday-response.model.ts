export interface ChangeHolidayResponse {
  employeeId: string;
  batchCode: string;
  holidayName: string;
  clientName: string;
  // The employee's assigned project site.
  area?: string | null;
  fullName: string;
  fromDate: string;
  toDate: string;
}
