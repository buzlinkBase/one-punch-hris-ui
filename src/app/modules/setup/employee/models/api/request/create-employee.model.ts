import type { PaymentMethod, SalaryType, EmploymentStatus, JobLevel } from '../response/employee-response.model';

export interface CreateEmployee {
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
