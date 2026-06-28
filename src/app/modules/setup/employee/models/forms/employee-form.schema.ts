import { z } from 'zod';

export const employeeFormSchema = z.object({
  // Personal
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  gender: z.string().optional(),
  civilStatus: z.string().optional(),
  dob: z.string().nullable().optional(),
  age: z.coerce.number().optional(),
  bloodType: z.string().optional(),
  contact: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),

  // Employment
  bioId: z.coerce.number().default(0),
  employeeNo: z.string().min(1, 'Employee number is required'),
  departmentId: z.string().nullable().optional(),
  areaId: z.string().nullable().optional(),
  payrollGroupId: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
  branchId: z.string().nullable().optional(),
  sectionId: z.string().nullable().optional(),
  positionId: z.string().nullable().optional(),
  jobLevel: z.enum(['Managerial', 'Supervisory', 'Executive', 'RankandFile', 'EntryLevel', 'TechnicalSpecialist', 'Contractual', 'FieldStaff']),
  timeShiftId: z.string().nullable().optional(),
  employmentStatus: z.enum(['Probationary', 'Regular', 'Contractual', 'ProjectBased', 'Seasonal', 'Casual', 'PartTime', 'Term', 'Internship']),
  hiringEntity: z.string().optional(),
  dateRegistered: z.string().min(1, 'Date registered is required'),
  hireDate: z.string().min(1, 'Hire date is required'),
  contractStart: z.string().nullable().optional(),
  contractEnd: z.string().nullable().optional(),
  dateResigned: z.string().nullable().optional(),
  status: z.string().min(1, 'Status is required'),
  restDays: z.array(z.string()).optional(),

  // Compensation
  modeOfPayment: z.enum(['Cash', 'ATM']),
  salaryType: z.enum(['DAILY', 'MONTHLY_VARIABLE', 'MONTHLY_FIXED']),
  monthlyRate: z.coerce.number().optional(),
  dailyRate: z.coerce.number().optional(),
  cola: z.coerce.number().optional(),
  bankName: z.string().optional(),
  bankNo: z.string().optional(),

  // Government IDs
  sssNo: z.string().optional(),
  phicNo: z.string().optional(),
  hdmfNo: z.string().optional(),
  tin: z.string().optional(),

  // Settings
  settings: z.object({
    isEligibleForOvertime: z.boolean(),
    isEligibleForHolidayPay: z.boolean(),
    isEligibleForNightDifferential: z.boolean(),
    isEligibleForLeaveCredits: z.boolean(),
    isEligibleFor13thMonth: z.boolean(),
  }).optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
