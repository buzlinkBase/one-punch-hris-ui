export type PaymentMethod = 'Cash' | 'ATM';
export type SalaryType = 'Daily' | 'Monthly Variable' | 'Monthly Fixed';
export type EmploymentStatus =
  | 'Probationary'
  | 'Regular'
  | 'Contractual'
  | 'Project Based'
  | 'Seasonal';
export type JobLevel = 'Rank and File' | 'Supervisor' | 'Manager' | 'Executive';

export interface EmployeeResponse {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  departmentId: string;
  operationAreaId: string;
  payrollGroupId: string;
  paymentMethod: PaymentMethod;
  salaryType: SalaryType;
  employmentStatus: EmploymentStatus;
  jobLevel: JobLevel;
  hireDate: string;
  status: string;
}
