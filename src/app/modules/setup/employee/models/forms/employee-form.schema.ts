import { z } from "zod";

export const employeeFormSchema = z.object({
  // Personal
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  gender: z.string().optional(),
  civilStatus: z.string().optional(),
  dob: z.string().nullable().optional(),
  bloodType: z.string().optional(),
  email: z
    .union([z.literal(""), z.string().email("Enter a valid email")])
    .optional(),
  contact: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),

  // Employment
  bioId: z.number().nullable().optional(),
  employeeNo: z.string().optional(),
  departmentId: z.string().nullable().optional(),
  areaId: z.string().nullable().optional(),
  payrollGroupId: z.string().min(1, "Payroll group is required"),
  clientId: z.string().nullable().optional(),
  branchId: z.string().nullable().optional(),
  sectionId: z.string().nullable().optional(),
  positionId: z.string().nullable().optional(),
  jobLevel: z.enum([
    "Managerial",
    "Supervisory",
    "Executive",
    "RankandFile",
    "EntryLevel",
    "TechnicalSpecialist",
    "Contractual",
    "FieldStaff",
  ]),
  timeShiftId: z.string().nullable().optional(),
  employmentStatus: z.enum([
    "Regular",
    "PartTime",
    "Probationary",
    "Contract",
    "Temporary",
    "Casual",
    "Intern",
    "OnLeave",
    "Suspended",
    "Terminated",
    "Resigned",
    "Retired",
    "Deceased",
  ]),
  hiringEntity: z.string().optional(),
  dateRegistered: z.string().min(1, "Date registered is required"),
  hireDate: z.string().nullable().optional(),
  contractStart: z.string().nullable().optional(),
  contractEnd: z.string().nullable().optional(),
  dateResigned: z.string().nullable().optional(),
  restDays: z.array(z.string()).optional(),

  // Compensation
  modeOfPayment: z.enum(["Cash", "ATM"]),
  salaryType: z.enum(["VARIABLE", "FIXED"]),
  monthlyRate: z.coerce.number().optional(),
  dailyRate: z.coerce.number().optional(),
  cola: z.coerce.number().optional(),
  dailyRateMode: z
    .enum(["Manual", "CalculatedEDR", "MonthlyTotalDays"])
    .optional(),
  factorDays: z.number().positive().nullable().optional(),
  useActualMonthDays: z.boolean().optional(),
  isRestDayPaid: z.boolean().optional(),
  isRegularHolidayIncluded: z.boolean().optional(),
  isSpecialNonWorkingIncluded: z.boolean().optional(),
  useEmployeeOverride: z.boolean().optional(),
  bankName: z.string().optional(),
  bankNo: z.string().optional(),

  // Government IDs
  sssNo: z.string().optional(),
  phicNo: z.string().optional(),
  hdmfNo: z.string().optional(),
  tin: z.string().optional(),
  rdoCode: z.string().optional(),

  // Statutory rates
  sssRate: z
    .object({
      computationType: z.string().optional(),
      eE: z.coerce.number().optional(),
      eR: z.coerce.number().optional(),
      eC: z.coerce.number().optional(),
      addOns: z.coerce.number().optional(),
    })
    .optional(),
  phicRate: z
    .object({
      computationType: z.string().optional(),
      eE: z.coerce.number().optional(),
      eR: z.coerce.number().optional(),
      addOns: z.coerce.number().optional(),
    })
    .optional(),
  hdmfRate: z
    .object({
      computationType: z.string().optional(),
      eE: z.coerce.number().optional(),
      eR: z.coerce.number().optional(),
      addOns: z.coerce.number().optional(),
    })
    .optional(),
  taxRate: z
    .object({
      computationType: z.string().optional(),
      eE: z.coerce.number().optional(),
      addOns: z.coerce.number().optional(),
    })
    .optional(),

  // Profile
  profileImg: z.string().optional(),

  // Settings
  settings: z
    .object({
      id: z.string().optional(),
      isEligibleForOvertime: z.boolean(),
      isEligibleForRegularHolidayPay: z.boolean(),
      isEligibleForSpecialHolidayPay: z.boolean(),
      isEligibleForNightDifferential: z.boolean(),
      isEligibleForLeaveCredits: z.boolean(),
      isEligibleFor13thMonth: z.boolean(),
    })
    .optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
