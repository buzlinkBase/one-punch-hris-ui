import type { EmployeeResponse } from '../models/api/response/employee-response.model';
import type { EmployeeFormValues } from '../models/forms/employee-form.schema';

export const employeeMapper = {
  toFormValues(response: EmployeeResponse): EmployeeFormValues {
    return {
      employeeNo: response.employeeNo,
      firstName: response.firstName,
      lastName: response.lastName,
      middleName: response.middleName,
      email: response.email,
      departmentId: response.departmentId,
      operationAreaId: response.operationAreaId,
      payrollGroupId: response.payrollGroupId,
      paymentMethod: response.paymentMethod,
      salaryType: response.salaryType,
      employmentStatus: response.employmentStatus,
      jobLevel: response.jobLevel,
      hireDate: response.hireDate,
      status: response.status,
    };
  },
};
