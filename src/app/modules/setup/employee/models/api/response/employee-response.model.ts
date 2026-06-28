export type ModeOfPayment = 'Cash' | 'ATM';
export type SalaryType = 'DAILY' | 'MONTHLY_VARIABLE' | 'MONTHLY_FIXED';
export type EmploymentStatus =
  | 'Probationary'
  | 'Regular'
  | 'Contractual'
  | 'ProjectBased'
  | 'Seasonal'
  | 'Casual'
  | 'PartTime'
  | 'Term'
  | 'Internship';
export type JobLevel =
  | 'Managerial'
  | 'Supervisory'
  | 'Executive'
  | 'RankandFile'
  | 'EntryLevel'
  | 'TechnicalSpecialist'
  | 'Contractual'
  | 'FieldStaff';

export type DayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface RestDayModel {
  id?: string;
  dayName: DayName;
}

export interface EmployeeSettingModel {
  id?: string;
  isEligibleForOvertime: boolean;
  isEligibleForHolidayPay: boolean;
  isEligibleForNightDifferential: boolean;
  isEligibleForLeaveCredits: boolean;
  isEligibleFor13thMonth: boolean;
}

export interface EmployeeResponse {
  id: string;
  bioId: number;
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
  contact?: string;
  address1?: string;
  address2?: string;
  profileImg?: string;
  status: string;
  restDays?: RestDayModel[];
  settings?: EmployeeSettingModel;
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
