// fromDay/toDay are day-of-week numbers (0=Sunday..6=Saturday, matching dayjs().day() and the
// backend's DayName enum ordering) computed client-side from the picked dates before posting.
export interface PortalRequestChangeRestDay {
  fromDay: number;
  toDay: number;
  payrollDateFrom: string;
  payrollDateTo: string;
}
