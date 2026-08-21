import { z } from "zod";

export const deductionApplicationFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  deductionId: z.string().min(1, "Deduction is required"),
  encodeDate: z.string().min(1, "Encode date is required"),
  startDate: z.string().min(1, "Start date is required"),
  frequencyOfPayment: z.string().min(1, "Frequency is required"),
  terms: z.number().int().min(1, "Terms must be at least 1"),
  totalPrincipal: z.number().positive("Principal must be positive"),
  interestRate: z.number().min(0, "Interest rate cannot be negative"),
  note: z.string().optional(),
  remarks: z.string().optional(),
});

export type DeductionApplicationFormValues = z.infer<
  typeof deductionApplicationFormSchema
>;
