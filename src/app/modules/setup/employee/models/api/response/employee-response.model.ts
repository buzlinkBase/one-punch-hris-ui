export type ModeOfPayment = "Cash" | "ATM";
export type SalaryType = "VARIABLE" | "FIXED";
export type DailyRateMode = "Manual" | "CalculatedEDR" | "MonthlyTotalDays";
/** Annual/monthly divisor used by Calculated EDR mode — see FACTOR_DAYS_OPTIONS for the
 * full curated list (PH DOLE standards, international/enterprise, continuous-ops, and
 * monthly-averaging conventions). Not a closed literal union since several conventions
 * (30.4167, 393.90, 337.80, ...) are non-integer. */
export type FactorDays = number;
export type EmploymentStatus =
  | "Regular"
  | "PartTime"
  | "Probationary"
  | "Contract"
  | "Temporary"
  | "Casual"
  | "Intern"
  | "OnLeave"
  | "Suspended"
  | "Terminated"
  | "Resigned"
  | "Retired"
  | "Deceased";
export type JobLevel =
  | "Managerial"
  | "Supervisory"
  | "Executive"
  | "RankandFile"
  | "EntryLevel"
  | "TechnicalSpecialist"
  | "Contractual"
  | "FieldStaff";

export type DayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface RestDayModel {
  id?: string;
  dayName: DayName;
}

export interface EmployeeFixedScheduleDayModel {
  id?: string;
  dayName: DayName;
  timeShiftId: string;
}

export interface EmployeeSettingModel {
  id?: string;
  isEligibleForOvertime: boolean;
  isEligibleForHolidayPay: boolean;
  isEligibleForNightDifferential: boolean;
  isEligibleForLeaveCredits: boolean;
  isEligibleFor13thMonth: boolean;
}

export interface StatutoryRate {
  computationType?: string;
  eE?: number;
  eR?: number;
  eC?: number;
  addOns?: number;
}

export interface EmployeeFullResponse extends EmployeeResponse {
  skills?: { id: string; name: string; level: number }[];
  educations?: { id: string; schoolName: string; yearGraduated: number }[];
  dependents?: {
    id: string;
    fullName: string;
    relationship: string;
    gender: string;
    dob: string;
  }[];
  employeeRecords?: {
    id: string;
    recordType: string;
    description: string;
    file: string;
  }[];
  employments?: {
    id: string;
    companyName: string;
    position: string;
    fromDate: string;
    toDate: string;
  }[];
  assets?: {
    id: string;
    assetType: string;
    assetDescription: string;
    model: string;
    brand: string;
    serialNo: string;
    qty: number;
    issuanceDate: string;
    returnedDate?: string;
    status: string;
    remarks: string;
    file: string;
  }[];
  sssRate?: StatutoryRate;
  phicRate?: StatutoryRate;
  hdmfRate?: StatutoryRate;
  taxRate?: StatutoryRate & { total?: number };
}

export interface EmployeeResponse {
  id: string;
  bioId?: number | null;
  employeeNo: string;
  departmentId?: string | null;
  payrollGroupId?: string | null;
  clientId?: string | null;
  areaId?: string | null;
  branchId?: string | null;
  sectionId?: string | null;
  positionId?: string | null;
  jobLevel: JobLevel;
  timeShiftId?: string | null;
  dateRegistered: string;
  hireDate: string;
  contractStart?: string | null;
  contractEnd?: string | null;
  civilStatus?: string;
  dateResigned?: string | null;
  hiringEntity?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  gender?: string;
  age?: number;
  monthlyRate?: number;
  dailyRate?: number;
  cola?: number;
  /** FIXED salary type only — Manual entry vs. computed (MonthlyRate * 12) / FactorDays. */
  dailyRateMode?: DailyRateMode;
  /** FIXED + CalculatedEDR mode only — the annual factor days divisor (365/313/261/252). */
  factorDays?: FactorDays | null;
  /** FIXED + MonthlyTotalDays mode only — divide by the actual days in the payroll month
   * (28/29/30/31) instead of the fixed factorDays denominator. */
  useActualMonthDays?: boolean;
  /** FIXED salary type only — the monthly rate already includes rest day pay. */
  isRestDayPaid?: boolean;
  /** FIXED salary type only — the monthly rate already includes regular holiday pay. */
  isRegularHolidayIncluded?: boolean;
  /** FIXED salary type only — the monthly rate already includes special non-working holiday pay. */
  isSpecialNonWorkingIncluded?: boolean;
  /** FIXED salary type only — the monthly rate already includes the mandatory night differential. */
  isNightDiffIncluded?: boolean;
  dob?: string | null;
  bloodType?: string;
  modeOfPayment: ModeOfPayment;
  salaryType: SalaryType;
  employmentStatus: EmploymentStatus;
  bankName?: string;
  bankNo?: string;
  sssNo?: string;
  phicNo?: string;
  hdmfNo?: string;
  tin?: string;
  email?: string | null;
  contact?: string;
  address1?: string;
  address2?: string;
  profileImg?: string;
  status: string;
  restDays?: RestDayModel[];
  settings?: EmployeeSettingModel;
  sssRate?: StatutoryRate;
  phicRate?: StatutoryRate;
  hdmfRate?: StatutoryRate;
  taxRate?: StatutoryRate & { total?: number };
  // Computed/joined fields from API
  fullName?: string;
  departmentName?: string;
  payrollGroupName?: string;
  branchName?: string;
  timeShiftName?: string;
  clientName?: string;
  positionName?: string;
  areaName?: string;
}
