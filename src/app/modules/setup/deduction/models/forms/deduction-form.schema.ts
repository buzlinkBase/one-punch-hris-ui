import { z } from "zod";

export const deductionFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Deduction name is required"),
  deductionTypeId: z.string().min(1, "Deduction type is required"),
  amount: z.number().min(0, "Amount must be 0 or greater"),
  status: z.string().min(1, "Status is required"),
});

export type DeductionFormValues = z.infer<typeof deductionFormSchema>;
