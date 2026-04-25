import { z } from 'zod';

export const employeeFormSchema = z.object({
  employeeNo: z.string().min(1, 'Employee number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  departmentId: z.string().min(1, 'Department is required'),
  operationAreaId: z.string().min(1, 'Operation area is required'),
  payrollGroupId: z.string().min(1, 'Payroll group is required'),
  paymentMethod: z.enum(['Cash', 'ATM']),
  salaryType: z.enum(['Daily', 'Monthly Variable', 'Monthly Fixed']),
  employmentStatus: z.enum([
    'Probationary',
    'Regular',
    'Contractual',
    'Project Based',
    'Seasonal',
  ]),
  jobLevel: z.enum(['Rank and File', 'Supervisor', 'Manager', 'Executive']),
  hireDate: z.string().min(1, 'Hire date is required'),
  status: z.string().min(1, 'Status is required'),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
