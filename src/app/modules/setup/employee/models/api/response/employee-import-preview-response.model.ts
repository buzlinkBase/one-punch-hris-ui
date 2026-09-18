/** One parsed row from an employee-import file, before anything is committed to the database —
 * mirrors backend EmployeeImportPreviewRow (which itself extends EmployeeImportModel). */
export interface EmployeeImportPreviewRow {
  rowNumber: number;
  errors: string[];

  bioId?: string;
  branchCode?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  suffix?: string;
  gender?: string;
  restDay1?: string;
  restDay2?: string;

  departmentName?: string;
  clientName?: string;
  payrollGroup?: string;
  shiftName?: string;
  shiftType?: string;

  amIn?: string;
  pmOut?: string;
  amOut?: string;
  pmIn?: string;
  paidLunchBreak?: boolean;
  breakDuration?: number;
  maxWorkingMinutes?: number;
  salaryType?: string;
  contactNo?: string;
  civilStatus?: string;
  bloodType?: string;

  sss?: string;
  phic?: string;
  hdmf?: string;
  tin?: string;
  dailyRate?: number;
  monthlyRate?: number;
  hireDate?: string | null;
  dateOfBirth?: string | null;

  cutoff1?: number;
  cutoff2?: number;
  cutoff3?: number;
  cutoff4?: number;

  eom1?: boolean;
  eom2?: boolean;
  eom3?: boolean;
  eom4?: boolean;
  address1?: string;
  address2?: string;
  bankName?: string;
  bankNo?: string;
}
