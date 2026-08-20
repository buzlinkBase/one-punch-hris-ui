import { z } from "zod";

export const otherIncomeFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  incomeClass: z.string().min(1, "Income class is required"),
  incomeTypeId: z.string().optional(),
  isTaxable: z.boolean(),
  status: z.string().min(1, "Status is required"),
});

export type OtherIncomeFormValues = z.infer<typeof otherIncomeFormSchema>;
