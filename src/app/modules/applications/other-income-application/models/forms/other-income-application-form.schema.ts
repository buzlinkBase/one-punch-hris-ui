import { z } from "zod";

export const otherIncomeApplicationFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  incomeId: z.string().min(1, "Income type is required"),
  encodeDate: z.string().min(1, "Encode date is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  frequencyOfPayment: z.string().min(1, "Frequency is required"),
  amount: z.number().positive("Amount must be positive"),
  isProrated: z.boolean(),
  remarks: z.string().optional(),
});

export type OtherIncomeApplicationFormValues = z.infer<
  typeof otherIncomeApplicationFormSchema
>;
