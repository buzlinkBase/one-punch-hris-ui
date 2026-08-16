import { z } from "zod";

export const leaveTypeFormSchema = z.object({
  // Identification
  code: z.string().min(1, "Code is required"),
  category: z.string().optional(),
  description: z.string().min(1, "Leave name is required"),
  legalBasis: z.string(),
  remarks: z.string(),

  // Pay & Source
  paySource: z.string().min(1, "Pay source is required"),
  employerAdvancesPayment: z.boolean(),

  // Accrual
  accrualBasis: z.string().min(1, "Accrual basis is required"),
  credits: z.number({ error: "Must be a number" }).min(0),
  accrualRate: z.number({ error: "Must be a number" }).min(0),
  maxAccrualBalance: z.number().min(0).nullable().optional(),
  proRateFirstYear: z.boolean(),
  leaveReset: z.string().min(1, "Reset policy is required"),

  // Eligibility
  minServiceMonths: z.number({ error: "Must be a number" }).min(0).int(),
  genderRestriction: z.string(),
  requiresApproval: z.boolean(),
  requiresSupportingDocument: z.boolean(),

  // Application Rules
  allowHalfDay: z.boolean(),
  allowPartial: z.boolean(),
  allowNegativeBalance: z.boolean(),
  maxDaysPerYear: z.number().min(0).nullable().optional(),
  maxConsecutiveDays: z
    .number({ error: "Must be a whole number" })
    .int("Must be a whole number (no decimals)")
    .min(1, "Must be at least 1 day")
    .nullable()
    .optional(),

  // Carry-Over
  carryOverType: z.string(),
  carryOverMaxDays: z.number().min(0),
  carryOverExpiryMonths: z.number().min(1).int().nullable().optional(),

  // Cash Conversion
  convertToCash: z.boolean(),
  cashConversionRate: z.number().min(0).max(1),
  maxCashConversionDays: z.number().min(0).nullable().optional(),

  // Statutory
  isStatutory: z.boolean(),
});

export type LeaveTypeFormValues = z.infer<typeof leaveTypeFormSchema>;
