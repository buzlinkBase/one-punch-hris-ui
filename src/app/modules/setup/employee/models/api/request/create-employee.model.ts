import type {
  ModeOfPayment,
  SalaryType,
  EmploymentStatus,
  JobLevel,
  RestDayModel,
  EmployeeSettingModel,
} from "../response/employee-response.model";

export interface CreateEmployee {
  bioId?: number | null;
  employeeNo?: string;
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
  hireDate?: string | null;
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
}
