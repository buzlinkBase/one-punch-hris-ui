import { z } from "zod";

export const companyInfoFormSchema = z.object({
  description: z.string().min(1, "Company name is required"),
  shortName: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  tin: z.string().optional(),
  rdoCode: z.string().optional(),
  sssNumber: z.string().optional(),
  philHealthNumber: z.string().optional(),
  pagIbigNumber: z.string().optional(),
  authorizedSignatoryName: z.string().optional(),
  authorizedSignatoryTitle: z.string().optional(),
  industryCode: z.string().optional(),
  subIndustryCode: z.string().optional(),
  businessType: z.string().optional(),
  companySize: z.string().optional(),
  registeredName: z.string().optional(),
  website: z.string().optional(),
  barangay: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  secondaryPhone: z.string().optional(),
  hrContactName: z.string().optional(),
  hrContactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  hrContactPhone: z.string().optional(),
  payrollContactName: z.string().optional(),
  payrollContactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  payrollContactPhone: z.string().optional(),
  employerType: z.string().optional(),
  isWithholdingAgent: z.boolean().optional(),
  atcCode: z.string().optional(),
  tinBranchCode: z.string().optional(),
  sssBranchCode: z.string().optional(),
  philHealthBranchCode: z.string().optional(),
  pagIbigBranchCode: z.string().optional(),
  secDtiNumber: z.string().optional(),
  // yyyy-MM-dd from the date inputs; "" when not set.
  registrationDate: z.string().optional(),
  businessPermitNo: z.string().optional(),
  businessPermitExpiry: z.string().optional(),
  payslipFooter: z.string().max(500, "Keep it under 500 characters").optional(),
  showLetterhead: z.boolean().optional(),
  employeeIdMode: z.enum(["Off", "Auto"]).optional(),
  employeeIdPrefix: z
    .string()
    .max(10, "Up to 10 characters")
    .regex(/^[A-Za-z0-9-]*$/, "Letters, numbers and dashes only")
    .optional(),
  employeeIdPadding: z.number().int().min(1).max(8).optional(),
  employeeIdIncludeYear: z.boolean().optional(),
  timeZone: z.string().optional(),
  currency: z.string().optional(),
  // A list in the form; the API stores it as comma-separated weekday names.
  workWeekRestDays: z.array(z.string()).optional(),
});

export type CompanyInfoFormValues = z.infer<typeof companyInfoFormSchema>;
